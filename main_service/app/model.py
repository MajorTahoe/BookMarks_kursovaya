# Преобразование документа MongoDB в Python-словарь
def serialize_bookmark(bookmark):
    return {
        "id": str(bookmark["_id"]),
        "url": bookmark["url"],
        "title": bookmark["title"],
        "description": bookmark["description"],
        "created_at": bookmark["created_at"],
        "tags": bookmark["tags"]
    }
