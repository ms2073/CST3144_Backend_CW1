const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

let client;
let db;

async function connectToDatabase() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'lesson_booking';
  if (!uri) throw new Error('MONGODB_URI is not set');

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  await client.connect();
  db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log('Connected to MongoDB');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call connectToDatabase first.');
  return db;
}

function getClient() {
  if (!client) throw new Error('MongoClient not initialized. Call connectToDatabase first.');
  return client;
}

function getCollections() {
  const database = getDb();
  return {
    lessons: database.collection('lessons'),
    orders: database.collection('orders'),
  };
}

module.exports = {
  connectToDatabase,
  getDb,
  getClient,
  getCollections,
  ObjectId,
};
