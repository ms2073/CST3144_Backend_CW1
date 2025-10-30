const express = require('express');
const { getCollections, ObjectId } = require('../db/mongo');

const router = express.Router();

function mapId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString?.() || _id, ...rest };
}

// GET /lessons - return all lessons
router.get('/', async (req, res, next) => {
  try {
    const { lessons } = getCollections();
    const all = await lessons.find({}).toArray();
    res.json(all.map(mapId));
  } catch (err) {
    next(err);
  }
});

// PUT /lessons/:id - update any lesson attribute (primarily spaces)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid lesson id' });

    const allowed = ['subject', 'location', 'price', 'spaces', 'imageFilename', 'iconClass'];
    const update = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const { lessons } = getCollections();
    const result = await lessons.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) return res.status(404).json({ error: 'Lesson not found' });
    res.json(mapId(result.value));
  } catch (err) {
    next(err);
  }
});

// shared search handler
async function searchHandler(req, res, next) {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json([]);

    const { lessons } = getCollections();
    const num = Number(q);
    const isNum = Number.isFinite(num);

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const filter = {
      $or: [
        { subject: { $regex: regex } },
        { location: { $regex: regex } },
      ],
    };
    if (isNum) {
      filter.$or.push({ price: num }, { spaces: num });
    }

    const results = await lessons.find(filter).toArray();
    res.json(results.map(mapId));
  } catch (err) {
    next(err);
  }
}

// GET /lessons/search
router.get('/search', searchHandler);

module.exports = router;
module.exports.searchHandler = searchHandler;
