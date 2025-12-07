require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function exportCollections() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'lesson_booking';

  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);

    // Export lessons collection
    console.log('\nExporting lessons collection...');
    const lessons = await db.collection('lessons').find({}).toArray();
    const lessonsPath = path.join(__dirname, '..', 'exports', 'lessons.json');
    fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
    console.log(`✓ Exported ${lessons.length} lessons to ${lessonsPath}`);

    // Export orders collection
    console.log('\nExporting orders collection...');
    const orders = await db.collection('orders').find({}).toArray();
    const ordersPath = path.join(__dirname, '..', 'exports', 'orders.json');
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    console.log(`✓ Exported ${orders.length} orders to ${ordersPath}`);

    console.log('\n✅ Export complete!');
    console.log('\nVerification:');
    console.log(`- Lessons: ${lessons.length} documents`);
    console.log(`- Orders: ${orders.length} documents`);

    if (lessons.length > 0) {
      console.log('\nSample lesson fields:', Object.keys(lessons[0]).join(', '));
    }
    if (orders.length > 0) {
      console.log('Sample order fields:', Object.keys(orders[0]).join(', '));
    }

  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

exportCollections();
