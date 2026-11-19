from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import check_connection
from app.routers import bookmarks


app = FastAPI(
    title="Bookmark Manager API",
    description="API для управления интернет-закладками",
    version="1.0.0"
)

# Проверка доступа к БД
@app.on_event("startup")
def startup():
    check_connection()


app.include_router(bookmarks.router)

# Подключаем фронтенд
FRONTEND_DIR = Path("frontend")


# Отдаём главную HTML-страницу
@app.get("/", include_in_schema=False)
def get_frontend():
    return FileResponse(FRONTEND_DIR / "index.html")


# Делаем CSS и JavaScript доступными браузеру
app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)