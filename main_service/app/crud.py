from datetime import datetime, timezone
from bson import ObjectId

from app.database import bookmarks_collection
from app.model import serialize_bookmark

# Создание закладки
def create_bookmark(bookmark_data):
    bookmark = bookmark_data.model_dump(mode="json")

    bookmark["created_at"] = datetime.now(timezone.utc)

    result = bookmarks_collection.insert_one(bookmark)

    return get_bookmark(str(result.inserted_id))


# Получение всех закладок
def get_bookmarks(search=None, tag=None, sort="desc"):
    query = {}

    if search:
        query["title"] = {
            "$regex": search,
            "$options": "i"
        }

    if tag:
        query["tags"] = {
            "$regex": tag,
            "$options": "i"
        }

    if sort == "asc":
        sort_order = 1
    else:
        sort_order = -1

    bookmarks = bookmarks_collection.find(query).sort(
        "created_at",
        sort_order
    )

    return [serialize_bookmark(bookmark) for bookmark in bookmarks]


# Получение 1 закладки
def get_bookmark(bookmark_id):
    if not ObjectId.is_valid(bookmark_id):
        return None

    bookmark = bookmarks_collection.find_one({
        "_id": ObjectId(bookmark_id)
    })

    if bookmark is None:
        return None

    return serialize_bookmark(bookmark)


# Изменение закладки
def update_bookmark(bookmark_id, bookmark_data):
    if not ObjectId.is_valid(bookmark_id):
        return None

    update_data = bookmark_data.model_dump(mode="json",
        exclude_unset=True,
        exclude_none=True
    )

    if not update_data:
        return get_bookmark(bookmark_id)

    result = bookmarks_collection.update_one(
        {"_id": ObjectId(bookmark_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return None

    return get_bookmark(bookmark_id)


# Удаление закладки
def delete_bookmark(bookmark_id):
    if not ObjectId.is_valid(bookmark_id):
        return False

    result = bookmarks_collection.delete_one({
        "_id": ObjectId(bookmark_id)
    })

    return result.deleted_count > 0
