import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

sample_menu = [
    # Pizzas
    {
        "id": str(uuid.uuid4()),
        "name": "Margherita Pizza",
        "description": "Classic pizza with fresh mozzarella, basil, and tomato sauce",
        "price": 250,
        "category": "Pizzas",
        "image_url": "https://images.unsplash.com/photo-1772494047822-d0375853f7fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxwaXp6YSUyMGNoZWVzZSUyMHB1bGx8ZW58MHx8fHwxNzcyODkzMjIxfDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Pepperoni Pizza",
        "description": "Loaded with pepperoni slices and extra cheese",
        "price": 320,
        "category": "Pizzas",
        "image_url": "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxwaXp6YSUyMGNoZWVzZSUyMHB1bGx8ZW58MHx8fHwxNzcyODkzMjIxfDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Veggie Supreme Pizza",
        "description": "Topped with fresh vegetables, olives, and cheese",
        "price": 290,
        "category": "Pizzas",
        "image_url": "https://images.unsplash.com/photo-1772494047822-d0375853f7fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxwaXp6YSUyMGNoZWVzZSUyMHB1bGx8ZW58MHx8fHwxNzcyODkzMjIxfDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Paneer Tikka Pizza",
        "description": "Indian style pizza with paneer tikka and special spices",
        "price": 310,
        "category": "Pizzas",
        "image_url": "https://images.unsplash.com/photo-1595708684082-a173bb3a06c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxwaXp6YSUyMGNoZWVzZSUyMHB1bGx8ZW58MHx8fHwxNzcyODkzMjIxfDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    # Garlic Bread
    {
        "id": str(uuid.uuid4()),
        "name": "Classic Garlic Bread",
        "description": "Crispy bread with garlic butter and herbs",
        "price": 120,
        "category": "Garlic Bread",
        "image_url": "",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Cheese Garlic Bread",
        "description": "Garlic bread topped with melted mozzarella cheese",
        "price": 150,
        "category": "Garlic Bread",
        "image_url": "",
        "available": True
    },
    # Burgers
    {
        "id": str(uuid.uuid4()),
        "name": "Chicken Burger",
        "description": "Juicy chicken patty with lettuce, tomato, and mayo",
        "price": 180,
        "category": "Burgers",
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxidXJnZXJ8ZW58MHx8fHwxNzcyODg1OTE1fDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Veg Cheese Burger",
        "description": "Veggie patty with cheese, lettuce, and special sauce",
        "price": 150,
        "category": "Burgers",
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxidXJnZXJ8ZW58MHx8fHwxNzcyODg1OTE1fDA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    # Pasta
    {
        "id": str(uuid.uuid4()),
        "name": "White Sauce Pasta",
        "description": "Creamy pasta with vegetables in white sauce",
        "price": 200,
        "category": "Pasta",
        "image_url": "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxwYXN0YXxlbnwwfHx8fDE3NzI4OTMyMjJ8MA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Red Sauce Pasta",
        "description": "Tangy pasta in tomato-based red sauce",
        "price": 190,
        "category": "Pasta",
        "image_url": "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxwYXN0YXxlbnwwfHx8fDE3NzI4OTMyMjJ8MA&ixlib=rb-4.1.0&q=85",
        "available": True
    },
    # Fries & Sides
    {
        "id": str(uuid.uuid4()),
        "name": "French Fries",
        "description": "Crispy golden french fries",
        "price": 100,
        "category": "Fries & Sides",
        "image_url": "",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Cheese Fries",
        "description": "French fries loaded with melted cheese",
        "price": 130,
        "category": "Fries & Sides",
        "image_url": "",
        "available": True
    },
    # Beverages
    {
        "id": str(uuid.uuid4()),
        "name": "Coca Cola",
        "description": "Chilled Coca Cola (330ml)",
        "price": 50,
        "category": "Beverages",
        "image_url": "",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Lime Soda",
        "description": "Refreshing lime soda with mint",
        "price": 60,
        "category": "Beverages",
        "image_url": "",
        "available": True
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Mango Shake",
        "description": "Thick and creamy mango shake",
        "price": 90,
        "category": "Beverages",
        "image_url": "",
        "available": True
    }
]

async def seed_database():
    # Check if menu already exists
    count = await db.menu_items.count_documents({})
    if count > 0:
        print(f"Database already has {count} menu items. Skipping seed.")
        return
    
    # Insert sample menu
    await db.menu_items.insert_many(sample_menu)
    print(f"Successfully seeded {len(sample_menu)} menu items!")
    
    # Initialize settings
    settings_count = await db.settings.count_documents({"id": "cafe_settings"})
    if settings_count == 0:
        await db.settings.insert_one({
            "id": "cafe_settings",
            "opening_hours": "11:00 AM – 10:00 PM",
            "phone": "+91 99564 07087",
            "address": "Unnao - Hardoi Rd, opposite Government Hospital, near Sudheer Mishthan Bhandar, Guddey Market, Mallawan, Uttar Pradesh 241303, India",
            "rating": 4.9,
            "total_reviews": 67,
            "price_range": "₹200 – ₹400"
        })
        print("Settings initialized!")

if __name__ == "__main__":
    asyncio.run(seed_database())
    client.close()
