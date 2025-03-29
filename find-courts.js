import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function searchAllDatabases() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const adminDb = client.db().admin();
    const { databases } = await adminDb.listDatabases();

    console.log('🔍 Searching for courts data...');
    
    for (const dbInfo of databases) {
      const dbName = dbInfo.name;
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      console.log(`\n📂 Database: ${dbName}`);
      
      for (const coll of collections) {
        const collection = db.collection(coll.name);
        const sampleDoc = await collection.findOne();
        
        console.log(`  └─ ${coll.name}`);
        console.log(`     Sample doc keys: ${sampleDoc ? Object.keys(sampleDoc) : 'Empty'}`);
        
        // Check for court-like data
        if (sampleDoc && ('courtName' in sampleDoc || 'address' in sampleDoc)) {
          console.log('     ⚡ POTENTIAL COURTS COLLECTION FOUND!');
          console.log(`     First document:`, JSON.stringify(sampleDoc, null, 2));
          return; // Exit if found
        }
      }
    }
  } finally {
    await client.close();
  }
}

searchAllDatabases().catch(console.error);