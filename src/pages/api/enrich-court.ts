import type { APIRoute } from 'astro';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { courtId, description, images, socialLinks, lastUpdated } = await request.json();
    
    // Preserve description as is - could be a string or object with content
    let descriptionToSave = description;
    
    console.log('📝 Received enrichment data for court:', {
      courtId,
      hasDescription: !!descriptionToSave,
      descriptionType: typeof descriptionToSave,
      isDescriptionObject: descriptionToSave && typeof descriptionToSave === 'object',
      imagesCount: images?.length || 0,
      socialLinksCount: socialLinks?.length || 0
    });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('google_maps_data');
    
    // Update the specific court document
    const result = await db.collection('pickleball_courts').updateOne(
      { _id: new ObjectId(courtId) },
      {
        $set: {
          description: descriptionToSave,
          images,
          socialLinks,
          lastUpdated
        }
      }
    );

    console.log('💾 MongoDB update result:', {
      courtId,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      success: result.acknowledged
    });

    if (result.matchedCount === 0) {
      console.error('❌ Court not found in MongoDB:', courtId);
      return new Response(
        JSON.stringify({ error: 'Court not found' }),
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      console.warn('⚠️ Court found but not modified:', courtId);
    } else {
      console.log('✅ Successfully updated court data in MongoDB:', courtId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        description: descriptionToSave,
        images,
        socialLinks,
        lastUpdated
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error in enrich-court API:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
} 