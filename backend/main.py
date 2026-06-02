from datetime import timedelta, timezone, datetime
from http.client import HTTPException
import json
from typing import Annotated, List, Optional
import uuid

import cloudinary
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlalchemy import Float, and_, cast, null, or_, select

from fastapi import FastAPI, Query, status, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session

from filters import CategoryFilter, ExactFilter, Filter, RangeFilter, SearchFilter
from constants import DataTypeEnum, RoleEnum
from database import engine, Base, get_db
from models import Attribute, AttributeData, Category, Listing, ListingAttributeData, ListingImages, UserModel
from fastapi.middleware.cors import CORSMiddleware


from dotenv import load_dotenv
import cloudinary.uploader

import tempfile
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

load_dotenv()

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)




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

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str
    role: RoleEnum
    disabled: bool

class UserInDB(User):
    hashed_password: str

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_hash.hash(password)

def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if user:
        return user

def authenticate_user(username: str, password: str, db: Session = Depends(get_db)):
    user = get_user(username, db)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user



def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("HASH_SECRET_KEY"), algorithm=os.getenv("ALGORITHM"))
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.getenv("HASH_SECRET_KEY"), algorithms=os.getenv("ALGORITHM"))
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user(token_data.username, db)
    
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")))
    access_token = create_access_token(
        data={"sub": user.username, "jti": user.id}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/users/me/")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> User:
    return current_user
    
@app.post("/users", tags=["Users"])
def create_user(username: str, email: str, password: str, role: RoleEnum, disabled: bool, db: Session = Depends(get_db)):
    myuuid = str(uuid.uuid4())
    hashed_password = get_password_hash(password)
    user = UserModel(id=myuuid, username=username, email=email, hashed_password=hashed_password,role=role, disabled=disabled)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.get("/users", tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()

@app.get("/get_role", tags=["Users"])
def get_users(id: str,db: Session = Depends(get_db)):
    if not id:
        return RoleEnum.GUEST
    user = db.query(UserModel).filter(UserModel.id == id).first()
    return user.role

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




@app.get("/categories", tags=["Categories"])
def get_categories(omit_null: Optional[bool] = False, db: Session = Depends(get_db)):
    if omit_null:
        return db.query(Category).filter(Category.parent_id != None).all()
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


@app.get("/attributes_for_create_listing", tags=["Attribute"])
def get_attributes(category_id: Optional[int] = None, db: Session = Depends(get_db)):
    attribute_query = db.query(Attribute).filter(or_(
        Attribute.category_id == category_id,
        Attribute.category_id.is_(None)
    )).all()
    filtered_ids = []
    for att in attribute_query:
        filtered_ids.append(att.id)

    data_query = db.query(AttributeData).filter(AttributeData.attribute_id.in_(filtered_ids)).all()


    return [attribute_query, data_query]

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


@app.get("/attribute_datas", tags=["Attribute data"])
def get_attribute_datas(
    attribute_ids: List[int],
    db: Session = Depends(get_db)
):
    return db.query(AttributeData).filter(AttributeData.attribute_id in attribute_ids).all()



@app.get("/listings", tags=["Listing"])
def get_listings(filters: str = Query(default='[]'), db: Session = Depends(get_db)):
    raw = json.loads(filters)

    parsed_filters: list[Filter] = [
        ExactFilter(**f) if f['type'] == 'exact' else SearchFilter(**f) if f["type"]=="search" else CategoryFilter(**f) if f["type"]=="category_id" else RangeFilter(**f)
        for f in raw
    ]
    query = select(Listing)
    search = ""
    category_id = ""
    matching_category_ids = []
    matching_listing_ids = None
    for f in parsed_filters:
        
        if isinstance(f, ExactFilter):
            print(f.value.split(","))
            values=f.value.split(",")
            matching_listing_ids = select(ListingAttributeData.listing_id).where(
                and_(
                    ListingAttributeData.attribute_id == f.attributeId,
                    ListingAttributeData.value.in_(values)
                )
            )

        elif isinstance(f, RangeFilter):
            conditions = [ListingAttributeData.attribute_id == f.attributeId]

            if f.from_ is not None:
                conditions.append(cast(ListingAttributeData.value, Float) >= float(f.from_))
            if f.to is not None:
                conditions.append(cast(ListingAttributeData.value, Float) <= float(f.to))

            matching_listing_ids = select(ListingAttributeData.listing_id).where(and_(*conditions))
        elif isinstance(f, SearchFilter):
            search = f.value
        
        elif isinstance(f, CategoryFilter):
            category_id = f.value
    if category_id != "":
        category_query = db.query(Category).all()

        for category in category_query:
            if category.id == int(category_id):
                matching_category_ids.append(category.id)
        matching_category_ids_count = 0
        while matching_category_ids_count < len(matching_category_ids):
            matching_category_ids_count = len(matching_category_ids)
            for category in category_query:
                if category.parent_id in matching_category_ids and category.id not in matching_category_ids:
                    matching_category_ids.append(category.id)
            
        
    if matching_listing_ids != None:
        if category_id != "":
            query = query.where(and_(Listing.name.ilike(f'%{search}%')),(Listing.id.in_(matching_listing_ids)), (Listing.category_id.in_(matching_category_ids)))
        
        else:
            query = query.where(and_(Listing.name.ilike(f'%{search}%')),(Listing.id.in_(matching_listing_ids)))
    else:
        if category_id != "":
            query = query.where(and_(Listing.name.ilike(f'%{search}%')),(Listing.category_id.in_(matching_category_ids)))
        else:
            query = query.where(Listing.name.ilike(f'%{search}%'))
    return db.execute(query).scalars().all()

@app.get("/listing_by_id", tags=["Listing"])
def get_listings(id: int, db: Session = Depends(get_db)):
    listing_data = db.query(Listing).filter(Listing.id == id).first()
    attributes = db.query(Attribute).filter(or_(Attribute.category_id == listing_data.category_id, Attribute.category_id == None)).all()
    listing_attribute_data = db.query(ListingAttributeData).filter(ListingAttributeData.listing_id == id).all()
    images = db.query(ListingImages).filter(ListingImages.listing_id == id).all()
    return {
        "listing": listing_data,
        "attributes": attributes,
        "listing_attribute_data": listing_attribute_data,
        "images": images
    }

@app.post("/create_listing", tags=["Listing"])
def create_listing(
    name: str,
    category_id: int,
    user_id: str,
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