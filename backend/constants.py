from enum import Enum


class DataTypeEnum(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"

class RoleEnum(str, Enum):
    USER = "user"
    ADMIN = "admin"
    GUEST = "guest"