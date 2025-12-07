# MongoDB Collection Exports

This folder contains exported MongoDB collections from MongoDB Compass.

## Instructions to Export Collections

1. Open MongoDB Compass
2. Connect to your MongoDB Atlas database: `mongodb+srv://BAMHITS22:22310314@cst3144cw1.u3co8ym.mongodb.net/`
3. Select the `lesson_booking` database
4. For the `lessons` collection:
   - Click on the `lessons` collection
   - Click "Export Collection" (or go to Collection menu > Export Collection)
   - Choose JSON format
   - Save as `lessons.json` in this folder
5. For the `orders` collection:
   - Click on the `orders` collection
   - Click "Export Collection"
   - Choose JSON format
   - Save as `orders.json` in this folder

## Required Files

- `lessons.json` - Export of all lesson documents
- `orders.json` - Export of all order documents

These exports are required for the coursework submission.

## Verification

After exporting, verify your files contain:
- **lessons.json**: At least 10 lesson documents with fields: `_id`, `subject`, `location`, `price`, `spaces`
- **orders.json**: All submitted orders with fields: `_id`, `name`, `phone`, `lessonIDs`, `spaces`, `createdAt`

## Coursework Submission

These JSON exports must be included in your final submission zip file along with:
- Source code
- README with GitHub and deployment links
- Postman collection exports
