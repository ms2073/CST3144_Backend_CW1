const express = require('express');
const { getCollections, getDb, getClient, ObjectId } = require('../db/mongo');

const router = express.Router();

// POST /orders - create an order and decrement lesson spaces atomically
router.post('/', async (req, res, next) => {
  const body = req.body || {};
  try {
    const name = body.name;
    const phone = body.phone;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing name or phone' });
    }

    // Support both old shape ({ lessonIDs, spaces }) and new frontend shape ({ lessons: [...] })
    let lessonIdsInput = body.lessonIDs;
    let spacesInput = body.spaces;

    if (!Array.isArray(lessonIdsInput) && Array.isArray(body.lessons)) {
      // derive from lessons array; each item may carry id (string) or _id
      lessonIdsInput = body.lessons.map((l) => l.id || l._id);
      // default each to 1 unless a specific quantity is provided
      spacesInput = body.lessons.map((l) => (typeof l.quantity === 'number' && l.quantity > 0 ? l.quantity : 1));
    }

    if (!Array.isArray(lessonIdsInput) || lessonIdsInput.length === 0) {
      return res.status(400).json({ error: 'lessonIDs or lessons array is required' });
    }

    const toObjectId = (id) => {
      if (id instanceof ObjectId) return id;
      if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
      throw Object.assign(new Error('Invalid ObjectId in lessonIDs/lessons'), { status: 400 });
    };

    const lessonObjectIds = lessonIdsInput.map(toObjectId);

    // spaces may be a single number or an array matching lessons length
    let perLesson = Array.isArray(spacesInput)
      ? spacesInput.map((n) => Number(n))
      : [Number(spacesInput)].filter((x) => Number.isFinite(x));

    if (perLesson.length === 0) {
      // if not provided, assume 1 each
      perLesson = lessonObjectIds.map(() => 1);
    }

    if (perLesson.length !== 1 && perLesson.length !== lessonObjectIds.length) {
      return res.status(400).json({ error: 'spaces must be a number or an array matching lessonIDs/lessons length' });
    }

    if (perLesson.length === 1) {
      perLesson = lessonObjectIds.map(() => Number(perLesson[0]));
    }

    if (perLesson.some((n) => !Number.isFinite(n) || n <= 0)) {
      return res.status(400).json({ error: 'spaces values must be positive numbers' });
    }

    const db = getDb();
    const client = getClient();
    const { lessons, orders } = getCollections();
    const session = client.startSession();

    let createdOrder;
    await session.withTransaction(async () => {
      // Check availability
      const foundLessons = await lessons
        .find({ _id: { $in: lessonObjectIds } })
        .toArray();
      if (foundLessons.length !== lessonObjectIds.length) {
        throw Object.assign(new Error('One or more lessons not found'), { status: 404 });
      }
      // Validate spaces
      for (let i = 0; i < foundLessons.length; i++) {
        const l = foundLessons[i];
        const dec = perLesson[i];
        if (typeof l.spaces !== 'number' || l.spaces < dec) {
          throw Object.assign(new Error(`Not enough spaces for lesson ${l._id}`), { status: 409 });
        }
      }
      // Decrement spaces
      for (let i = 0; i < foundLessons.length; i++) {
        const lId = lessonObjectIds[i];
        const dec = perLesson[i];
        const upd = await lessons.updateOne(
          { _id: lId, spaces: { $gte: dec } },
          { $inc: { spaces: -dec } },
          { session }
        );
        if (upd.matchedCount === 0 || upd.modifiedCount === 0) {
          throw Object.assign(new Error('Concurrent update detected; please try again'), { status: 409 });
        }
      }
      // Create order
      const orderDoc = {
        name,
        phone,
        lessonIDs: lessonObjectIds,
        spaces: perLesson,
        createdAt: new Date(),
      };
      const insert = await orders.insertOne(orderDoc, { session });
      createdOrder = { ...orderDoc, _id: insert.insertedId };
    });

    res.status(201).json(createdOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


