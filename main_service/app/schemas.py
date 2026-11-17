
from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


# Схема для создания закладки
class BookmarkCreate(BaseModel):
    url: HttpUrl
    title: str = Field(min_length=1)
    description: str
    tags: list[str] = Field(default_factory=list)


# Схема для изменения закладки
class BookmarkUpdate(BaseModel):
    url: HttpUrl | None = None
    title: str | None = None
    description: str | None = None
    tags: list[str] | None = None


# Схема для возвращения закладки пользователю
class BookmarkResponse(BaseModel):
    id: str
    url: HttpUrl
    title: str
    description: str
    created_at: datetime
    tags: list[str]
