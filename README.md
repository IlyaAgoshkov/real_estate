# Real Estate Project

Этот проект — веб-приложение для просмотра и анализа предложений квартир. Включает backend на Django и frontend на React.

## Основные возможности
- Загрузка и парсинг квартир с внешнего источника
- Просмотр списка и детальной информации о квартирах
- Фильтрация, сортировка, галерея, популярные предложения
- Актуальные цены, прогнозы, фото

## Стек технологий
- **Backend:** Django, Django REST Framework, Celery, PostgreSQL
- **Frontend:** React
- **Docker** для контейнеризации

## Как запустить проект

### 1. Клонируйте репозиторий
```sh
git clone <адрес-репозитория>
cd real_estate_project
```

### 2. Запуск через Docker Compose

Убедитесь, что установлены Docker и Docker Compose.

```sh
docker-compose up -d --build
```

- Backend будет доступен на http://localhost:8000
- Frontend — на http://localhost:3000

### 3. Импорт квартир (опционально)

Выполните команду для импорта квартир:
```sh
docker-compose exec backend python manage.py import_flats
```
(или замените `backend` на имя вашего backend-сервиса)
```sh
docker-compose exec backend python manage.py calculate_forecast_prices
```
### 4. Остановка
```sh
docker-compose down
```

---

### Альтернативный запуск (без Docker)

#### Backend
1. Перейдите в папку `apartments_service`:
   ```sh
   cd apartments_service
   ```
2. Установите зависимости:
   ```sh
   pip install -r ../requirements.txt
   ```
3. Запустите сервер:
   ```sh
   python manage.py runserver
   ```

#### Frontend
1. Перейдите в папку `frontend`:
   ```sh
   cd frontend
   ```
2. Установите зависимости:
   ```sh
   npm install
   ```
3. Запустите React-приложение:
   ```sh
   npm start
   ```

---
