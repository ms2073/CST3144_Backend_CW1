require('dotenv').config();
const { connectToDatabase, getCollections } = require('../db/mongo');

async function main() {
  await connectToDatabase();
  const { lessons } = getCollections();

  const sample = [
    { subject: 'Art', location: 'Manchester', price: 75, spaces: 2 },
    { subject: 'Art', location: 'Bristol', price: 80, spaces: 5 },
    { subject: 'English', location: 'London', price: 90, spaces: 5 },
    { subject: 'English', location: 'York', price: 85, spaces: 5 },
    { subject: 'English', location: 'Bristol', price: 95, spaces: 5 },
    { subject: 'Math', location: 'London', price: 100, spaces: 4 },
    { subject: 'Math', location: 'Oxford', price: 100, spaces: 5 },
    { subject: 'Math', location: 'York', price: 80, spaces: 4 },
    { subject: 'Music', location: 'Bristol', price: 90, spaces: 5 },
    { subject: 'Music', location: 'Manchester', price: 85, spaces: 5 },
    { subject: 'Science', location: 'London', price: 110, spaces: 5 },
    { subject: 'Science', location: 'Oxford', price: 120, spaces: 5 }
  ];

  await lessons.deleteMany({});
  const result = await lessons.insertMany(sample);
  console.log(`Seeded ${result.insertedCount} lessons.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


