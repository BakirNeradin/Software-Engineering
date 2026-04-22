from sqlalchemy import Boolean, Enum as SQLEnum

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from constants import DataTypeEnum
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

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

    category = relationship("Attribute", backref="attribute_data")