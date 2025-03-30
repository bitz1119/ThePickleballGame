export async function enrichCourtData(courtId: string, courtName: string, address?: string) {
  try {
    console.log('📡 Calling Tavily API for:', { courtId, courtName, address });
    
    // First, get data from Tavily
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.TAVILY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `${courtName} ${address || ''} pickleball court facility details reviews location amenities contact information`,
        search_depth: "advanced",
        include_answer: true,
        include_images: true,
        max_results: 5
      })
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error('❌ Tavily API error:', tavilyResponse.status, errorText);
      throw new Error(`Tavily API error: ${tavilyResponse.status} - ${errorText}`);
    }

    const tavilyData = await tavilyResponse.json();
    console.log('✅ Tavily data received:', {
      hasAnswer: !!tavilyData.answer,
      imagesCount: tavilyData.images?.length || 0,
      resultsCount: tavilyData.results?.length || 0,
      answer: tavilyData.answer?.slice(0, 100) + '...' // Log first 100 chars of answer
    });

    // Process images to ensure they're valid URLs and actually load
    const images = await Promise.all(
      (tavilyData.images || [])
        .map(async (img) => {
          try {
            const url = new URL(img);
            // Check if image actually loads
            const response = await fetch(url.toString(), { method: 'HEAD' });
            return response.ok ? url.toString() : null;
          } catch {
            return null;
          }
        })
    ).then(urls => urls.filter(Boolean));

    // Extract social links from results with better filtering
    const socialLinks = tavilyData.results
      .filter(result => {
        const url = result.url.toLowerCase();
        // Only match main profile URLs, not individual posts/reels
        return (url.includes('facebook.com/') && !url.includes('/posts/')) || 
               (url.includes('instagram.com/') && !url.includes('/p/') && !url.includes('/reel/')) || 
               (url.includes('twitter.com/') && !url.includes('/status/')) ||
               (url.includes('youtube.com/') && !url.includes('/watch?v=')) ||
               // Match website if it contains the court name (case insensitive)
               (!url.includes('facebook.com') && 
                !url.includes('instagram.com') && 
                !url.includes('twitter.com') && 
                !url.includes('youtube.com') &&
                url.toLowerCase().includes(courtName.toLowerCase()));
      })
      .map(result => {
        const url = result.url.toLowerCase();
        let platform = 'Website';
        if (url.includes('facebook.com')) platform = 'Facebook';
        else if (url.includes('instagram.com')) platform = 'Instagram';
        else if (url.includes('twitter.com')) platform = 'Twitter';
        else if (url.includes('youtube.com')) platform = 'YouTube';
        
        // Clean up URLs to get main profile
        let cleanUrl = result.url;
        if (platform !== 'Website') {
          cleanUrl = cleanUrl.split('?')[0]; // Remove query parameters
          cleanUrl = cleanUrl.replace(/\/$/, ''); // Remove trailing slash
        }
        
        return { platform, url: cleanUrl };
      })
      // Remove duplicates by URL
      .filter((link, index, self) => 
        index === self.findIndex((t) => t.url === link.url)
      );

    // Enhance description by combining answer and relevant content
    let enhancedDescription = tavilyData.answer || '';
    
    // Add relevant information from raw content
    const relevantContent = tavilyData.results
      .filter(result => {
        // Filter out social media and irrelevant pages
        const url = result.url.toLowerCase();
        return !url.includes('facebook.com') && 
               !url.includes('instagram.com') && 
               !url.includes('twitter.com') &&
               !url.includes('youtube.com');
      })
      .map(result => result.content)
      .join('\n\n');

    if (relevantContent) {
      // Add relevant content if it provides new information
      const contentWords = new Set(relevantContent.toLowerCase().split(/\s+/));
      const answerWords = new Set(enhancedDescription.toLowerCase().split(/\s+/));
      const newWords = [...contentWords].filter(word => !answerWords.has(word));
      
      if (newWords.length > 50) { // If there's significant new information
        enhancedDescription += '\n\n' + relevantContent;
      }
    }

    // Now update MongoDB with the enriched data
    const baseUrl = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
    const apiUrl = new URL('/api/enrich-court', baseUrl).toString();
    
    console.log('🔗 Using API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        courtId,
        description: enhancedDescription,
        images,
        socialLinks,
        lastUpdated: new Date()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Enrich API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Court data enriched:', {
      hasDescription: !!data.description,
      imagesCount: data.images?.length || 0,
      socialLinksCount: data.socialLinks?.length || 0
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error in enrichCourtData:', error);
    return null;
  }
} 