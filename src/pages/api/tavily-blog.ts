import { tavily } from "@tavily/core";
import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";
import slugify from "slugify";
import { OpenAI } from "openai";

interface TavilyImage {
  url: string;
  description?: string;
}

interface TavilyResponse {
  query?: string;
  answer?: string;
  images?: TavilyImage[];
  results?: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

const downloadImage = async (imageUrl: string, fileName: string) => {
  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(fileName, buffer);
    return true;
  } catch (error) {
    console.error(`Error downloading image: ${error}`);
    return false;
  }
};

const generateSectionContent = async (openai: OpenAI, title: string, context: string, sourceUrl?: string) => {
  // First generate the main content
  const response = await openai.chat.completions.create({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [
      {
        role: "system",
        content: `Generate engaging, detailed content for a blog section about pickleball. The content should be:
- 150-200 words long
- Well-structured with clear paragraphs
- SEO optimized with natural keyword usage
- Include specific details and examples
- Maintain a professional yet engaging tone
- Include 2-3 places where external references could be naturally inserted
- Mark potential reference points with [REF]
${sourceUrl ? '- Reference the source material from: ' + sourceUrl : ''}`
      },
      {
        role: "user",
        content: `Write detailed content for the section titled "${title}"\n\nContext: ${context}`
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  let content = response.choices[0].message.content || "";

  // If we have a source URL, let's integrate it naturally into the content
  if (sourceUrl) {
    try {
      const hostname = new URL(sourceUrl).hostname;
      
      // Replace [REF] markers with actual references
      if (content.includes('[REF]')) {
        // Create different reference formats to vary the style
        const refFormats = [
          `[${hostname}](${sourceUrl})`,
          `[learn more](${sourceUrl})`,
          `[source](${sourceUrl})`,
          `[read more at ${hostname}](${sourceUrl})`,
          `[details](${sourceUrl})`
        ];

        // Replace each [REF] with a randomly selected format
        content = content.replace(/\[REF\]/g, () => {
          const randomFormat = refFormats[Math.floor(Math.random() * refFormats.length)];
          return randomFormat;
        });
      } else {
        // If no [REF] markers, append the reference at the end
        content += `\n\n*Learn more at [${hostname}](${sourceUrl})*`;
      }
    } catch (error) {
      console.error('Error processing URL:', error);
      content += `\n\n*Source: [Link](${sourceUrl})*`;
    }
  }

  return content;
};

const generateMarkdownContent = async (data: TavilyResponse, imageNames: string[]) => {
  const date = new Date().toISOString().split('T')[0];
  const title = data.query?.charAt(0).toUpperCase() + data.query?.slice(1) || "";
  
  // Initialize OpenAI client for Mistral
  const openai = new OpenAI({
    baseURL: "https://api-inference.huggingface.co/v1/",
    apiKey: import.meta.env.OPENAI_API_KEY
  });

  // Generate main article content
  const mainArticleResponse = await openai.chat.completions.create({
    model: "mistralai/Mistral-Nemo-Instruct-2407",
    messages: [
      {
        role: "system",
        content: `Generate a comprehensive blog post structure about pickleball with the following sections:
1. Introduction (brief overview)
2. History and Background
3. Current State and Popularity
4. Facilities and Venues
5. Community and Events
6. Tips for Beginners
7. Future Prospects

Each section should have a clear title and be well-organized.`
      },
      {
        role: "user",
        content: `Create a structured blog post about: ${title}\n\nContext: ${data.answer}`
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  const blogStructure = mainArticleResponse.choices[0].message.content || "";
  const sections = blogStructure.split(/\n(?=##? )/);

  let markdown = `---
layout: ../../layouts/BlogLayout.astro
title: "🎾 ${title}"
date: '${date}'
description: "${data.answer?.slice(0, 150) || ""}..."
image: ${imageNames[0] ? imageNames[0].replace('public', '') : '/'}
---

`;

  // Generate content for each section
  let currentImageIndex = 0;
  const usedUrls = new Set<string>();

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (!section) continue;

    const sectionTitle = section.split('\n')[0];
    
    // Find relevant results for this section
    const relevantResults = data.results?.filter(result => 
      !usedUrls.has(result.url) &&
      (result.title.toLowerCase().includes(sectionTitle.toLowerCase().replace(/^#+\s*/, '')) ||
       result.content.toLowerCase().includes(sectionTitle.toLowerCase().replace(/^#+\s*/, '')))
    ) || [];

    // Get up to 3 relevant URLs for this section
    const sectionUrls = relevantResults.slice(0, 3).map(r => r.url);
    sectionUrls.forEach(url => usedUrls.add(url));

    const sectionContent = await generateSectionContent(
      openai, 
      sectionTitle, 
      data.answer || "", 
      sectionUrls.join(',') // Pass all URLs for the section
    );
    
    markdown += `${sectionTitle}\n\n${sectionContent}\n\n`;

    // Insert image after the section if available
    if (currentImageIndex < imageNames.length) {
      const imagePath = imageNames[currentImageIndex];
      const imageDescription = data.images?.[currentImageIndex]?.description || '';
      
      markdown += `![${imageDescription}](${imagePath.replace('public', '')})\n`;
      markdown += `${imageDescription}\n\n`;
      
      currentImageIndex++;
    }
  }

  // Add additional content from results
  if (data.results?.length) {
    markdown += `## Additional Resources\n\n`;
    for (const result of data.results) {
      if (result.content && !usedUrls.has(result.url)) {
        const enhancedContent = await generateSectionContent(openai, result.title, result.content, result.url);
        markdown += `### ${result.title}\n\n${enhancedContent}\n\n`;
        usedUrls.add(result.url);
      }
    }
  }

  // Add References section with all used URLs
  if (usedUrls.size > 0) {
    markdown += `\n## References\n\n`;
    Array.from(usedUrls).forEach(url => {
      const hostname = new URL(url).hostname;
      markdown += `- [${hostname}](${url})\n`;
    });
  }

  return markdown;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
      });
    }

    // Initialize Tavily client
    const client = tavily({ apiKey: import.meta.env.TAVILY_API_KEY });

    // Get search results
    const response = await client.search(query, {
      searchDepth: "advanced",
      timeRange: "year",
      includeAnswer: true,
      includeImages: true,
      includeImageDescriptions: true,
      includeRawContent: true,
    });

    // Create blog post filename
    const slug = slugify(query.toLowerCase());
    const blogFileName = `${slug}.md`;
    const blogDir = path.join(process.cwd(), "src/pages");
    const publicImagesDir = path.join(process.cwd(), "public/images/generated");

    // Ensure directories exist
    await fs.mkdir(blogDir, { recursive: true });
    await fs.mkdir(publicImagesDir, { recursive: true });

    // Download and save images
    const imageNames: string[] = [];
    for (let i = 0; i < response.images.length; i++) {
      const image = response.images[i];
      const imageExt = path.extname(image.url) || '.jpg';
      const imageName = `${slug}-${i}${imageExt}`;
      const imagePath = path.join(publicImagesDir, imageName);
      
      const success = await downloadImage(image.url, imagePath);
      if (success) {
        imageNames.push(imagePath);
      }
    }

    // Generate markdown content
    const markdownContent = await generateMarkdownContent(response, imageNames);

    // Save markdown file
    const blogPath = path.join(blogDir, blogFileName);
    await fs.writeFile(blogPath, markdownContent);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Blog post generated successfully",
        path: `/generated-blog/${blogFileName}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error generating blog:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

