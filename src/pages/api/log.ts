import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Log to console with timestamp
    const timestamp = new Date().toISOString();
    console.log('\n📱 Mobile Location Log:', timestamp);
    console.log('------------------------------------------');
    console.log('Message:', data.message);
    
    // If there's detailed data, log it
    if (data.data) {
      console.log('Data:', JSON.stringify(data.data, null, 2));
    }
    
    // If there's an error, log it
    if (data.error) {
      console.log('Error:', JSON.stringify(data.error, null, 2));
    }
    
    // If there's a user agent, log it
    if (data.userAgent) {
      console.log('User Agent:', data.userAgent);
    }
    
    console.log('------------------------------------------\n');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error logging location data:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to log data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 