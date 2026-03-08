from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dk-pizza-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    available: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    available: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    rating: int
    comment: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    full_name: str
    is_admin: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "cafe_settings"
    opening_hours: str = "11:00 AM – 10:00 PM"
    phone: str = "+91 99564 07087"
    address: str = "Unnao - Hardoi Rd, opposite Government Hospital, near Sudheer Mishthan Bhandar, Guddey Market, Mallawan, Uttar Pradesh 241303, India"
    rating: float = 4.9
    total_reviews: int = 67
    price_range: str = "₹200 – ₹400"

class SettingsUpdate(BaseModel):
    opening_hours: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    total_reviews: Optional[int] = None
    price_range: Optional[str] = None

class WhatsAppOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    items: List[dict]
    total: float
    customer_address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WhatsAppOrderCreate(BaseModel):
    items: List[dict]
    total: float
    customer_address: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# Auth routes
@api_router.post("/auth/signup", response_model=Token)
async def signup(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user ID
    import uuid
    user_id = str(uuid.uuid4())
    
    # Hash password
    hashed_password = hash_password(user.password)
    
    # Create user document
    user_doc = {
        "id": user_id,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "is_admin": True,  # First user is admin
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    user_response = User(
        id=user_id,
        email=user.email,
        full_name=user.full_name,
        is_admin=True
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await db.users.find_one({"email": user.email}, {"_id": 0})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["id"]}, expires_delta=access_token_expires
    )
    
    user_response = User(
        id=db_user["id"],
        email=db_user["email"],
        full_name=db_user["full_name"],
        is_admin=db_user.get("is_admin", False)
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Menu routes
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu(category: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    menu_items = await db.menu_items.find(query, {"_id": 0}).to_list(1000)
    return [MenuItem(**item) for item in menu_items]

@api_router.post("/menu", response_model=MenuItem)
async def create_menu_item(item: MenuItemCreate, admin: User = Depends(get_admin_user)):
    import uuid
    item_id = str(uuid.uuid4())
    
    item_doc = {
        "id": item_id,
        **item.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.menu_items.insert_one(item_doc)
    return MenuItem(**item_doc)

@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu_item(item_id: str, item: MenuItemUpdate, admin: User = Depends(get_admin_user)):
    existing_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = {k: v for k, v in item.model_dump().items() if v is not None}
    
    if update_data:
        await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    
    updated_item = await db.menu_items.find_one({"id": item_id}, {"_id": 0})
    return MenuItem(**updated_item)

@api_router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str, admin: User = Depends(get_admin_user)):
    result = await db.menu_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

# Reviews routes
@api_router.get("/reviews", response_model=List[Review])
async def get_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).to_list(1000)
    return [Review(**review) for review in reviews]

# Settings routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({"id": "cafe_settings"}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = Settings().model_dump()
        await db.settings.insert_one(default_settings)
        return Settings(**default_settings)
    return Settings(**settings)

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings: SettingsUpdate, admin: User = Depends(get_admin_user)):
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    
    if update_data:
        await db.settings.update_one(
            {"id": "cafe_settings"},
            {"$set": update_data},
            upsert=True
        )
    
    updated_settings = await db.settings.find_one({"id": "cafe_settings"}, {"_id": 0})
    return Settings(**updated_settings)

# WhatsApp orders routes
@api_router.post("/orders", response_model=WhatsAppOrder)
async def create_order(order: WhatsAppOrderCreate):
    import uuid
    order_id = str(uuid.uuid4())
    
    order_doc = {
        "id": order_id,
        **order.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.whatsapp_orders.insert_one(order_doc)
    return WhatsAppOrder(**order_doc)

@api_router.get("/orders", response_model=List[WhatsAppOrder])
async def get_orders(admin: User = Depends(get_admin_user)):
    orders = await db.whatsapp_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [WhatsAppOrder(**order) for order in orders]

@api_router.get("/")
async def root():
    return {"message": "DK Pizza Cafe API"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
