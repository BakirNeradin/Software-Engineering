from http.client import HTTPException
from typing import List, Optional
from pydantic import BaseModel

from sqlalchemy import null
import cloudinary
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from constants import DataTypeEnum
from database import engine, Base, get_db
from models import Attribute, AttributeData, Category, Listing, ListingAttributeData, ListingImages, User
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI, File, UploadFile, HTTPException
from dotenv import load_dotenv
import cloudinary.uploader

import tempfile
import os

load_dotenv()

app = FastAPI()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# create tables
Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API running"}


@app.post("/users", tags=["Users"])
def create_user(name: str, email: str, db: Session = Depends(get_db)):
    user = User(name=name, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/category", tags=["Categories"])
def create_category(
    name: str,
    parent_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if parent_id is not None:
        parent = db.query(Category).filter(Category.id == parent_id).first()
        if not parent:
            raise HTTPException(400, "Parent not found")

    category = Category(name=name, parent_id=parent_id)
    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@app.get("/users", tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/categories", tags=["Categories"])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@app.post("/attribute", tags=["Attribute"])
def create_attribute(
    name: str,
    data_type: DataTypeEnum,
    
    multiple_choice: bool,
    user_written: bool,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    attribute = Attribute(name=name, category_id=category_id, data_type=data_type, 
                          multiple_choice=multiple_choice, user_written=user_written)
    db.add(attribute)
    db.commit()
    db.refresh(attribute)

    return attribute

class AttributeClass(BaseModel):
    name: str
    category_id: int
    data_type: DataTypeEnum
    user_written: bool
    multiple_choice: bool

@app.post("/attributes", tags=["Attribute"])
def create_attribute(
    attributes: List[AttributeClass],
    db: Session = Depends(get_db)
):
    created_attributes = []
    print(attributes)
    for att in attributes:
        attribute = Attribute(
            name=att.name,
            category_id=att.category_id,
            data_type=att.data_type,
            multiple_choice=att.multiple_choice,
            user_written=att.user_written
        )
        db.add(attribute)
        created_attributes.append(attribute)

    db.commit()

    for attribute in created_attributes:
        db.refresh(attribute)

    return created_attributes


@app.get("/attributes", tags=["Attribute"])
def get_attributes(null_attribute: Optional[bool] = False, db: Session = Depends(get_db)):
    query = db.query(Attribute)
    if null_attribute:
        query = query.filter(Attribute.category_id == None)
         
    return query.all()

@app.post("/attribute_data", tags=["Attribute data"])
def create_attribute_data(
    name: str,
    attribute_id: int,
    
    db: Session = Depends(get_db)
):
    attribute_data = AttributeData(name=name, attribute_id=attribute_id)
    db.add(attribute_data)
    db.commit()
    db.refresh(attribute_data)

    return attribute_data

@app.get("/attribute_data", tags=["Attribute data"])
def get_attributes(db: Session = Depends(get_db)):
    return db.query(AttributeData).all()

class AttributeDataClass(BaseModel):
    name: str
    attribute_id: int
    

@app.post("/attribute_datas", tags=["Attribute data"])
def create_attribute_datas(
    attribute_data: List[AttributeDataClass],
    db: Session = Depends(get_db)
    
):
    

    created_attribute_data= []
    print(attribute_data)
    for att in attribute_data:
        attribute_data = AttributeData(
            name=att.name,
            attribute_id=att.attribute_id,
            
        )
        db.add(attribute_data)
        created_attribute_data.append(attribute_data)

    db.commit()

    for attribute in created_attribute_data:
        db.refresh(attribute)
    
    

    return created_attribute_data

@app.get("/listings", tags=["Listing"])
def get_listings(db: Session = Depends(get_db)):
    return db.query(Listing).all()


@app.post("/create_listing", tags=["Listing"])
def create_listing(
    name: str,
    category_id: int,
    user_id: int,
    description: Optional[str] = None,

    
    db: Session = Depends(get_db)
):
    listing = Listing(name=name, category_id=category_id, user_id=user_id, description=description)
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return listing


@app.get("/listings_attribute_data", tags=["Listing"])
def get_listings_data(db: Session = Depends(get_db)):
    return db.query(ListingAttributeData).all()

@app.post("/create_listings_data", tags=["Listing"])
def create_listing(
    listing_id: int,
    attribute_id: int,
    value: str,

    
    db: Session = Depends(get_db)
):
    listing = ListingAttributeData(value=value, listing_id=listing_id, attribute_id=attribute_id)
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return listing

@app.get("/listing_images", tags=["Listing"])
def get_listing_images(db: Session = Depends(get_db)):
    return db.query(ListingImages).all()

@app.post("/create_listing_images", tags=["Listing"])
def create_image_listing(
    listing_id: int,
    image_url: str,

    
    db: Session = Depends(get_db)
):
    listing = ListingImages(image_url=image_url, listing_id=listing_id)
    db.add(listing)
    db.commit()
    db.refresh(listing)

    return listing

@app.post("/upload", tags=["Upload image"])
async def upload_image(image: UploadFile = File(...)):
    print(image)
    temp_path = None
    try:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        suffix = os.path.splitext(image.filename)[1] if image.filename else ".jpg"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await image.read())
            temp_path = temp_file.name

        result = cloudinary.uploader.upload(temp_path)

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)