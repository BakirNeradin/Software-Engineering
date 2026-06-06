from datetime import timedelta, timezone, datetime
from http.client import HTTPException
import json
from typing import Annotated, List, Optional
import uuid

import cloudinary
import httpx
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr
from sqlalchemy import Float, and_, cast, null, or_, select

from fastapi import BackgroundTasks, FastAPI, Query, Request, status, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session

from filters import CategoryFilter, ExactFilter, Filter, RangeFilter, SearchFilter
from constants import DataTypeEnum, RoleEnum
from database import engine, Base, get_db
from models import Attribute, AttributeData, Category, Listing, ListingAttributeData, ListingImages, Location, Reviews, UserMessages, UserModel
from fastapi.middleware.cors import CORSMiddleware


from dotenv import load_dotenv
import cloudinary.uploader
import stripe
import tempfile
import os
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

load_dotenv()

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

class EmailSchema(BaseModel):
    email: List[EmailStr]
    subject: str
    body: str

@app.post("/send-email")
def send_email_background(background_tasks: BackgroundTasks, email: EmailSchema):
    message = MessageSchema(
        subject=email.subject,
        recipients=email.email,
        body=email.body,
        subtype=MessageType.plain
    )

    fm = FastMail(conf)

    background_tasks.add_task(fm.send_message, message)

    return {"message": "Email has been scheduled to send in the background"}

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CheckoutRequest(BaseModel):
    product_name: str
    amount: int  # amount in cents
    quantity: int = 1
    user_id: str
    points: int



@app.get("/")
def root():
    return {"message": "API running"}

@app.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest):
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": data.product_name,
                        },
                        "unit_amount": data.amount,
                    },
                    "quantity": data.quantity,
                }
            ],
            success_url=f"{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/payment-cancel",
            metadata={
                "user_id": data.user_id,
                "points": data.points
               
            },
        )

        return {"url": session.url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload,
            sig_header,
            STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event.type == "checkout.session.completed":
        session = event.data.object

        session_id = session.id
        payment_status = session.payment_status

        customer_email = None
        if session.customer_details:
            customer_email = session.customer_details.email

        print("Payment completed:", session_id, customer_email, payment_status)
        print("session:", session.metadata.user_id)

        user_id = session.metadata.user_id
        points = session.metadata.points

        user = db.query(UserModel).filter(UserModel.id == user_id).update({UserModel.points: UserModel.points + points})
        db.commit()
        db.refresh(user)

    return {"received": True}

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str
    role: RoleEnum
    location_id: int
    disabled: bool
    points: int

class UserInDB(User):
    hashed_password: str

class UserUpdate(BaseModel):
    username: str
    email: str
    location_id: int
    password: str | None = None

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
def create_user(username: str, email: str, password: str, role: RoleEnum, disabled: bool, location_id: str, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(
        or_(UserModel.username == username, UserModel.email == email)
    ).first()

    if existing_user:
        if existing_user.username == username:
            raise HTTPException(status_code=400, detail="Username is already taken")

        raise HTTPException(status_code=400, detail="Email is already registered")

    myuuid = str(uuid.uuid4())
    hashed_password = get_password_hash(password)
    user = UserModel(id=myuuid, username=username, email=email, hashed_password=hashed_password,role=role, disabled=disabled, location_id = location_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.get("/users", tags=["Users"])
def get_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()

@app.get("/users_search", tags=["Users"])
def get_users(search: str = "",db: Session = Depends(get_db)):
    users = db.query(UserModel).where(UserModel.username.ilike(f'%{search}%')).all()
    return [
        {
            "id": user.id,
            "username": user.username,
        }
        for user in users
    ]
    

@app.get("/locations", tags=["Location"])
def get_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@app.get("/location_by_id", tags=["Location"])
def get_locations(id: int,db: Session = Depends(get_db)):
    return db.query(Location).filter(Location.id == id).first()

@app.get("/get_user_by_id",response_model=User, tags=["Users"])
def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    return db.query(UserModel).filter(UserModel.id == user_id).first()

@app.put("/users/{user_id}", tags=["Users"])
def update_user(
    user_id: str,
    data: UserUpdate,
    current_user: Annotated[UserModel, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own profile")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(UserModel).filter(
        UserModel.id != user_id,
        or_(UserModel.username == data.username, UserModel.email == data.email)
    ).first()

    if existing_user:
        if existing_user.username == data.username:
            raise HTTPException(status_code=400, detail="Username is already taken")

        raise HTTPException(status_code=400, detail="Email is already registered")

    user.username = data.username
    user.email = data.email
    user.location_id = data.location_id

    if data.password is not None:
        if not data.password.strip():
            raise HTTPException(status_code=400, detail="Password cannot be empty")

        user.hashed_password = get_password_hash(data.password)

    db.commit()
    db.refresh(user)

    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "location_id": user.location_id,
        "disabled": user.disabled,
        "points": user.points,
    }

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
    return db.execute(query.order_by(Listing.highlighted_until.desc())).scalars().all()

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


@app.get("/listing_by_user_id", tags=["Listing"])
def get_listings(user_id: str, db: Session = Depends(get_db)):
    listing_data = db.query(Listing).filter(Listing.user_id == user_id).all()
    if (len(listing_data) == 0):
        return {
        "listings": [],
        "listing_attribute_data": [],
        "images": []
    }
    listing_attribute_data = db.query(ListingAttributeData).all()
    images = db.query(ListingImages).all()
    return {
        "listings": listing_data,
        "listing_attribute_data": listing_attribute_data,
        "images": images
    }

@app.put("/highlight_listing", tags=["Listing"])
def highlight_listing(
    listing_id: str,
    user_id: str,
    points: int,
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if listing.user_id != user.id:
        raise HTTPException(status_code=403, detail="Only the listing owner can highlight this listing")

    if points <= 0:
        raise HTTPException(status_code=400, detail="Points must be greater than 0")

    if user.points < points:
        raise HTTPException(status_code=400, detail="Not enough points")

    current_time = datetime.now()
    highlighted_until = listing.highlighted_until or current_time

    if current_time > highlighted_until:
        listing.highlighted_until = current_time + timedelta(seconds=points)
    else:
        listing.highlighted_until = highlighted_until + timedelta(seconds=points)

    user.points -= points
    db.commit()
    db.refresh(listing)
    db.refresh(user)

    return listing

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

@app.delete("/delete_listing", tags=["Listing"])
def delete_listing(id: int, db: Session = Depends(get_db)):

    listing = db.query(Listing).filter(Listing.id == id).first()
    if listing:
        db.delete(listing)
        db.commit()
        return {"deleted": True}
    return {"deleted": False}


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

@app.get("/user_messages", tags=["Messages"])
def get_messages(db: Session = Depends(get_db)):
    return db.query(UserMessages).all()

@app.get("/user_message_by_ids", tags=["Messages"])
def get_messages(sender_id: str, recipient_id: str, db: Session = Depends(get_db)):
    return (
        db.query(UserMessages)
        .filter(
            or_(
                and_(
                    UserMessages.recipient_id == sender_id,
                    UserMessages.sender_id == recipient_id,
                ),
                and_(
                    UserMessages.recipient_id == recipient_id,
                    UserMessages.sender_id == sender_id,
                ),
            )
        )
        .order_by(UserMessages.message_date.asc())
        .all()
    )

@app.get("/user_message_by_id", tags=["Messages"])
def get_messages(user_id: str, db: Session = Depends(get_db)):
     
     messages = db.query(UserMessages).filter(
            or_(
                UserMessages.sender_id == user_id, UserMessages.recipient_id == user_id
            )
        ).order_by(UserMessages.message_date.desc()).all()
     foundUsers = []
     selectedMessages = []
     for msg in messages:
        if msg.recipient_id != user_id:
            if msg.recipient_id not in foundUsers:
                foundUsers.append(msg.recipient_id)
                selectedMessages.append(msg)
        elif msg.sender_id != user_id:
            if msg.sender_id not in foundUsers:
                foundUsers.append(msg.sender_id)
                selectedMessages.append(msg)
     return selectedMessages

@app.post("/user_messages", tags=["Messages"])
async def  send_message(
    sender_id: str,
    recipient_id: str,
    message: str,
    sender_username: str,
    recipient_username: str,
    
    db: Session = Depends(get_db)
):
    message = UserMessages(sender_id=sender_id, recipient_id=recipient_id, message=message, sender_username=sender_username, recipient_username=recipient_username)
    db.add(message)
    db.commit()
    db.refresh(message)
    user = db.query(UserModel).filter(UserModel.id == recipient_id).first()
    async with httpx.AsyncClient() as client:
        await client.post("http://localhost:8000/send-email", json={
            "email": [user.email],
            "subject": "You have received a new message!",
            "body": f"Hello, {sender_username} has sent you a message"
        })

    return message

@app.get("/reviews_all", tags=["Reviews"])
def get_reviews(db: Session = Depends(get_db)):
    return db.query(Reviews).all()

@app.post("/new_review", tags=["Reviews"])
def create_review(
    reviewing_user_id: str,
    reviewing_username: str,
    reviewed_user_id: str,
    rating: int,
    comment: str,
    db: Session = Depends(get_db)
):
    review = Reviews(reviewing_user_id=reviewing_user_id, reviewing_username=reviewing_username,reviewed_user_id=reviewed_user_id,rating=rating,comment=comment)
    db.add(review)
    db.commit()
    db.refresh(review)

    return review

@app.get("/get_reviews_for_user", tags=["Reviews"])
def get_reviews_for_user(id: str, db: Session = Depends(get_db)):
    return db.query(Reviews).filter(Reviews.reviewed_user_id==id).all()

@app.put("/edit_review", tags=["Reviews"])
def get_reviews_for_user(id: int, comment: str, rating: int, db: Session = Depends(get_db)):
    review = db.query(Reviews).filter(Reviews.id==id).first()
    review.comment = comment
    review.rating = rating
    db.commit()
    db.refresh(review)

    return review

@app.get("/highlighted_listings", tags=["Home"])
def get_highlighted_listings(db: Session = Depends(get_db)):
    return db.query(Listing).filter(Listing.highlighted_until > datetime.now()).all()