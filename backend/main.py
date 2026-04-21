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
