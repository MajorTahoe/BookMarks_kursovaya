
from fastapi import APIRouter, HTTPException, status

from app import crud
from app.schemas import BookmarkCreate, BookmarkUpdate, BookmarkResponse


router = APIRouter(
    prefix="/bookmarks",
    tags=["Закладки"]
)


# Создание закладки
@router.post("/", response_model=BookmarkResponse)
def create_bookmark(bookmark: BookmarkCreate):
    return crud.create_bookmark(bookmark)


# Получение всех закладок

@router.get("/", response_model=list[BookmarkResponse])
def get_bookmarks(
    search: str | None = None,
    tag: str | None = None,
    sort: str = "desc"
):
    if sort not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400,
            detail="Параметр sort должен быть asc или desc"
        )

    return crud.get_bookmarks(
        search=search,
        tag=tag,
        sort=sort
    )



# Получение одной закладки
@router.get("/{bookmark_id}", response_model=BookmarkResponse)
def get_bookmark(bookmark_id: str):
    bookmark = crud.get_bookmark(bookmark_id)

    if bookmark is None:
        raise HTTPException(
            status_code=404,
            detail="Закладка не найдена"
        )

    return bookmark


# Изменение закладки
@router.patch("/{bookmark_id}", response_model=BookmarkResponse)
def update_bookmark(bookmark_id: str, update_data: BookmarkUpdate):
    bookmark = crud.update_bookmark(bookmark_id, update_data)

    if bookmark is None:
        raise HTTPException(
            status_code=404,
            detail="Закладка не найдена"
        )

    return bookmark


# Удаление закладки
@router.delete("/{bookmark_id}")
def delete_bookmark(bookmark_id: str):
    deleted = crud.delete_bookmark(bookmark_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Закладка не найдена"
        )
