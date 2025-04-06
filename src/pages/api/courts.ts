import type { APIRoute } from 'astro';
import clientPromise from '../../lib/mongodb';

const ITEMS_PER_PAGE = 9;
const MAX_DISTANCE_KM = 50; // Maximum radius to search in kilometers

export const GET: APIRoute = async ({ request }) => {
  try {
    console.log('🔍 API Request received');
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const state = url.searchParams.get('state');
    const country = url.searchParams.get('country');
    const search = url.searchParams.get('search');
    const lat = parseFloat(url.searchParams.get('lat') || '');
    const lng = parseFloat(url.searchParams.get('lng') || '');

    console.log('📝 Raw query params:', { page, state, country, search, lat, lng });

    // Build query
    const query: Record<string, any> = {};

    // Add geospatial query if coordinates are provided
    if (!isNaN(lat) && !isNaN(lng)) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] // MongoDB uses [longitude, latitude] order
          },
          $maxDistance: MAX_DISTANCE_KM * 1000 // Convert km to meters
        }
      };
    } else {
      // Only add other filters if not doing geospatial search
      if (state && state !== 'all' && state !== 'undefined') {
        query.state = state;
      }
      
      if (country && country !== 'all' && country !== 'undefined') {
        // Map country names to country codes
        const countryCodeMap = {
          'India': 'IN',
          'United States': 'US'
        };
        query.countryCode = countryCodeMap[country as keyof typeof countryCodeMap] || country;
      }
      
      if (search && search !== 'undefined') {
        query.title = { $regex: search, $options: 'i' };
      }
    }

    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db('google_maps_data');
    console.log('✅ Connected to MongoDB');

    // Create geospatial index if it doesn't exist
    try {
      await db.collection('pickleball_courts').createIndex({ location: "2dsphere" });
    } catch (error) {
      console.warn('Warning: Could not create geospatial index', error);
    }

    // Get total count for pagination
    const totalCourts = await db.collection('pickleball_courts').countDocuments(query);
    console.log('📊 Total courts found:', totalCourts);

    const totalPages = Math.ceil(totalCourts / ITEMS_PER_PAGE);
    console.log('📑 Total pages:', totalPages);

    // Get paginated courts
    const skip = (page - 1) * ITEMS_PER_PAGE;
    console.log('⏭️ Skipping:', skip, 'courts');

    let courts = await db.collection('pickleball_courts')
      .find(query)
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .toArray();

    // If doing geospatial search, calculate and add distance to each court
    if (!isNaN(lat) && !isNaN(lng)) {
      courts = courts.map(court => {
        if (court.location) {
          const distance = calculateDistance(
            lat, 
            lng, 
            court.location.lat || court.location.coordinates[1],
            court.location.lng || court.location.coordinates[0]
          );
          return { ...court, distance };
        }
        return court;
      });
    }

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
      url: `/courts/${court._id}`,
      distance: court.distance // Add distance if available
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

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

function toRad(degrees: number): number {
  return degrees * (Math.PI/180);
} 