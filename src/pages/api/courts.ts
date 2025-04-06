import type { APIRoute } from 'astro';
import clientPromise from '../../lib/mongodb';

const ITEMS_PER_PAGE = 9;

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔍 API Request received');
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const state = url.searchParams.get('state');
    const country = url.searchParams.get('country');
    const search = url.searchParams.get('search');

    console.log('📝 Raw query params:', { page, state, country, search });

    // Build query
    const query: Record<string, any> = {};

    // Only add parameters if they are valid and not 'all'
    if (state && state !== 'all' && state !== 'undefined') {
      query.state = state;
    }
    
    if (country && country !== 'all' && country !== 'undefined') {
      // Map country names to country codes
      const countryCodeMap = {
        'India': 'IN',
        'United States': 'US'
      };
      query.countryCode = countryCodeMap[country] || country;
    }
    
    if (search && search !== 'undefined') {
      query.title = { $regex: search, $options: 'i' };
    }

    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('google_maps_data');
    console.log('✅ Connected to MongoDB');

    // Get total count for pagination
    const totalCourts = await db.collection('pickleball_courts').countDocuments(query);
    console.log('📊 Total courts found:', totalCourts);

    const totalPages = Math.ceil(totalCourts / ITEMS_PER_PAGE);
    console.log('📑 Total pages:', totalPages);

    // Get paginated courts
    const skip = (page - 1) * ITEMS_PER_PAGE;
    console.log('⏭️ Skipping:', skip, 'courts');

    const courts = await db.collection('pickleball_courts')
      .find(query)
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    console.log(`📚 Found ${courts.length} courts for page ${page}`);

    // Transform courts data
    const courtsData = courts.map(court => ({
      id: court._id.toString(),
      slug: court.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: court.title,
      state: court.state,
      countryCode: court.countryCode,
      imageUrl: court.images?.[0] || court.imageUrl || '/images/default-court.jpg',
      images: court.images || [],
      description: court.description,
      address: court.address,
      totalScore: court.totalScore || 4.0,
      rating: court.totalScore || 4.0,
      reviewsCount: court.reviewsCount || 0,
      categories: court.categories || ['Pickleball Court'],
      openingHours: court.openingHours || [],
      socialLinks: court.socialLinks || [],
      amenities: court.additionalInfo?.Amenities || [],
      capacity: court.capacity || null,
      lastUpdated: court.lastUpdated || null,
      url: `/courts/${court._id}`
    }));

    console.log('✨ Transformed courts data');

    const response = {
      courts: courtsData,
      totalCourts,
      totalPages,
      currentPage: page
    };

    console.log('📤 Sending response with', courtsData.length, 'courts');

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('❌ Error in courts API:', error);
    return new Response(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 