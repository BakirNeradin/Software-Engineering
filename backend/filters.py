from pydantic import BaseModel, Field
from typing import Literal, Union, Optional, Annotated

class ExactFilter(BaseModel):
    attributeId: int
    type: Literal['exact']
    value: str

class RangeFilter(BaseModel):
    attributeId: int
    type: Literal['range']
    from_: Optional[str] = Field(None, alias='from')
    to: Optional[str] = None

    model_config = {'populate_by_name': True}

class SearchFilter(BaseModel):
    type: Literal['search']
    value: str

class CategoryFilter(BaseModel):
    type: Literal['category_id']
    value: str

Filter = Annotated[
    Union[ExactFilter, RangeFilter, SearchFilter, CategoryFilter],
    Field(discriminator='type')
]