## Lesson Booking Backend (Express + MongoDB Native Driver)

Secure, JSON-only REST API for a Vue.js lesson booking frontend.

**Live Deployment:** https://cst3144-backend-cw1.onrender.com

**Test Endpoint:** https://cst3144-backend-cw1.onrender.com/lessons

### Tech
- Express.js
- MongoDB Atlas (native `mongodb` driver, no ODM)
- Helmet, CORS, basic rate limiting, centralized JSON errors

### Setup
1. Create `.env`:
```
PORT=8080
MONGODB_URI=<your MongoDB Atlas URI>
DB_NAME=lesson_booking
# Optional: comma-separated origins, leave empty for dev
CORS_ORIGINS=
```
2. Install deps and run:
```
npm install
npm run dev
```

### Endpoints
- GET `/lessons` → list all lessons
- PUT `/lessons/:id` → update lesson fields (e.g., decrement `spaces`)
- GET `/lessons/search?q=...` → server-side search across subject/location and numeric match for price/spaces
- POST `/orders` → create order and atomically decrement lesson spaces
- GET `/health` → health check
- Static images: `/public/images/<filename>` or `/images/:filename` (JSON 404 if missing)

### Seeding
```
npm run seed
```
Seeds at least 10 lessons.

### Postman
Import `postman/lesson-booking.postman_collection.json`.

### Deployment (Render)
**Deployed URL:** https://cst3144-backend-cw1.onrender.com

Setup steps:
1. Create a new Web Service, connect GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add environment variables from `.env`

### Exports
Export your `lessons` and `orders` collections via MongoDB Compass and include in `exports/`.


