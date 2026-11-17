import os
from pymongo import MongoClient

# Адрес подключения к MongoDB
MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://root:example@localhost:27017/?authSource=admin"
)

# Создаём клиент для подключения к MongoDB
client = MongoClient(MONGO_URL)

# Выбираем базу данных
database = client["bookmark_db"]

# Выбираем коллекцию закладок
bookmarks_collection = database["bookmarks"]


# Проверяем подключение к MongoDB
def check_connection():
    client.admin.command("ping")
