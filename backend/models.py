from sqlalchemy import Boolean, Date, DateTime, Enum as SQLEnum
import datetime
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from constants import DataTypeEnum, RoleEnum
from database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String,unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(SQLEnum(RoleEnum))
    disabled = Column(Boolean, default=False)  

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # relationship
    parent = relationship("Category", remote_side=[id], backref="children")

class Attribute(Base):
    __tablename__ = "attributes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    data_type = Column(SQLEnum(DataTypeEnum), nullable=False)
    multiple_choice = Column(Boolean)
    user_written = Column(Boolean)

    category = relationship("Category", backref="attributes")

class AttributeData(Base):
    __tablename__ = "attribute_data"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    attribute_id = Column(Integer, ForeignKey("attributes.id"))

    attribute = relationship("Attribute", backref="attribute_data")

class Listing(Base):
    __tablename__ = "listing"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    category_id = Column(Integer, ForeignKey("categories.id"))
    user_id = Column(String, ForeignKey("users.id"))
    publishing_date = Column(DateTime, default=datetime.datetime.now)
    description = Column(String)

    category = relationship("Category", backref="listing")
    user = relationship("UserModel", backref="listing")

class ListingAttributeData(Base):
    __tablename__ = "listing_attribute_data"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listing.id"))
    attribute_id = Column(Integer, ForeignKey("attributes.id"))
    value = Column(String, nullable=True)

    listing = relationship("Listing", backref="listing_attribute_data")
    attributes = relationship("Attribute", backref="listing_attribute_data")

class ListingImages(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listing.id"))
    image_url = Column(String)

    listing = relationship("Listing", backref="listing_images") 