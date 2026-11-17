FROM python:3.12-slim

WORKDIR /app

# Копируем файл зависимостей
COPY main_service/requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код основного сервиса
COPY main_service/app ./app

# Копируем фронтенд
COPY frontend ./frontend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
