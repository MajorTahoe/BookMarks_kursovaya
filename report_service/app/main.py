from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
import httpx
from collections import Counter
import os

MAIN_SERVICE_URL = os.getenv(
    "MAIN_SERVICE_URL",
    "http://127.0.0.1:8000"
)

app = FastAPI(
    title="Bookmark Reports API",
    description="Сервис формирования отчётов по закладкам",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/reports/tags")
def get_tag_report():
    try:
        response = httpx.get(
            f"{MAIN_SERVICE_URL}/bookmarks/",
            timeout=10.0,
            trust_env=False
        )
        response.raise_for_status()

    except httpx.HTTPError as e:
        print("Ошибка запроса:", repr(e))

        raise HTTPException(
            status_code=503,
            detail="Основной сервис закладок недоступен"
        )

    bookmarks = response.json()

    tag_counts = Counter()

    for bookmark in bookmarks:
        tag_counts.update(bookmark["tags"])

    return dict(sorted(
        tag_counts.items(),
        key=lambda item: item[0].casefold()
    ))
