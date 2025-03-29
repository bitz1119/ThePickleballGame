import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function run() {
  // Verify URI exists
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in .env file');
  }
  console.log('Using URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//****:****@'));

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected successfully');

    // List databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log('\n📦 Databases:');
    console.log(databases.databases.map(db => `- ${db.name}`).join('\n'));

    // Check collections in pickleball database
    const targetDb = client.db('pickleball');
    const collections = await targetDb.listCollections().toArray();
    
    console.log('\n🗂 Collections in "pickleball":');
    console.log(collections.length > 0 
      ? collections.map(c => `- ${c.name}`).join('\n') 
      : 'No collections found');

  } catch (e) {
    console.error('❌ Connection failed:', e.message);
  } finally {
    await client.close();
  }
}

run();