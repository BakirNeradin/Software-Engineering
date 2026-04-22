from http.client import HTTPException
from typing import Optional

from sqlalchemy import null

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from constants import DataTypeEnum
from database import engine, Base, get_db
from models import Attribute, AttributeData, Category, User
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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

@app.get("/attribute", tags=["Attribute"])
def get_attributes(db: Session = Depends(get_db)):
    return db.query(Attribute).all()

@app.post("/attribute_data", tags=["Attribute data"])
def create_attribute(
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