#!/usr/bin/env python3
import os
import json
from pymongo import MongoClient
from urllib.parse import quote_plus

# MongoDB connection details
MONGODB_URI = "mongodb+srv://BAMHITS22:22310314@cst3144cw1.u3co8ym.mongodb.net/?appName=CST3144CW1"
DB_NAME = "lesson_booking"

def export_collections():
    try:
        # Connect to MongoDB
        print("Connecting to MongoDB...")
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]

        # Export lessons collection
        print("\nExporting lessons collection...")
        lessons_cursor = db['lessons'].find({})
        lessons = list(lessons_cursor)

        # Convert ObjectId to string for JSON serialization
        for lesson in lessons:
            if '_id' in lesson:
                lesson['_id'] = str(lesson['_id'])

        lessons_path = os.path.join(os.path.dirname(__file__), '..', 'exports', 'lessons.json')
        with open(lessons_path, 'w') as f:
            json.dump(lessons, f, indent=2, default=str)
        print(f"✓ Exported {len(lessons)} lessons to {lessons_path}")

        # Export orders collection
        print("\nExporting orders collection...")
        orders_cursor = db['orders'].find({})
        orders = list(orders_cursor)

        # Convert ObjectId to string for JSON serialization
        for order in orders:
            if '_id' in order:
                order['_id'] = str(order['_id'])
            if 'lessonIDs' in order:
                order['lessonIDs'] = [str(lid) for lid in order['lessonIDs']]
            if 'createdAt' in order:
                order['createdAt'] = str(order['createdAt'])

        orders_path = os.path.join(os.path.dirname(__file__), '..', 'exports', 'orders.json')
        with open(orders_path, 'w') as f:
            json.dump(orders, f, indent=2, default=str)
        print(f"✓ Exported {len(orders)} orders to {orders_path}")

        print("\n✅ Export complete!")
        print(f"\nVerification:")
        print(f"- Lessons: {len(lessons)} documents")
        print(f"- Orders: {len(orders)} documents")

        if lessons:
            print(f"\nSample lesson fields: {', '.join(lessons[0].keys())}")
        if orders:
            print(f"Sample order fields: {', '.join(orders[0].keys())}")

        client.close()
        print("\nMongoDB connection closed")

    except Exception as e:
        print(f"Export failed: {e}")
        exit(1)

if __name__ == "__main__":
    export_collections()
