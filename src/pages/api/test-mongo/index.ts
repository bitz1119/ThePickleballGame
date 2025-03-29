import type { APIRoute } from 'astro';
import clientPromise from '../../../lib/mongodb';

export const get: APIRoute = async () => {
  try {
    const client = await clientPromise;
    const db = client.db('pickleball');
    const collections = await db.listCollections().toArray();
    
    return new Response(JSON.stringify({ 
      success: true, 
      collections: collections.map(c => c.name) 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ 
      error: e.message,
      stack: e.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};