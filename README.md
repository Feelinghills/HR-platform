# HR InterviewPlatform

Проект для производственной практики: платформа технических собеседований на C# / .NET 10 + React.

## Что реализовано

- JWT-авторизация и роли: `Admin`, `HR`, `DecisionMaker`.
- Реестр пользователей с добавлением администратором.
- Реестр кандидатов, карточка кандидата, архивация.
- Реестр вакансий.
- Реестр собеседований с фильтрацией, планированием, статусами и решением по кандидату.
- Справочник компетенций и матрица оценок компетенций.
- Журнал аудита изменений по ключевым сущностям.
- PDF-формы: карточка кандидата, протокол собеседования, письмо/оффер/отказ.
- PostgreSQL + EF Core, слои `API`, `Core`, `Domain`, `Infrastructure`.

## Быстрый запуск

1. Поднять PostgreSQL + Backend + Frontend:

```powershell
docker compose up -d
```

2. Войти под seed-пользователем:

```http
POST http://localhost:3000
```

## Seed-пользователи

- `admin@example.com` / `Admin123!` - администратор.
- `hr@example.com` / `Hr123!` - отдел кадров.
- `decision@example.com` / `Decision123!` - принимающий решение.

## Основные endpoints

- `POST /api/auth/login`
- `GET /api/users`, `POST /api/users`
- `GET /api/candidates`, `POST /api/candidates`, `PUT /api/candidates/{id}`, `POST /api/candidates/{id}/archive`
- `GET /api/vacancies`, `POST /api/vacancies`
- `GET /api/competencies`, `POST /api/competencies`
- `GET /api/interviews`, `POST /api/interviews`
- `PUT /api/interviews/{id}/matrix`
- `POST /api/interviews/{id}/decision`
- `GET /api/reports/candidates/{candidateId}/card`
- `GET /api/reports/interviews/{interviewId}/protocol`
- `GET /api/reports/interviews/{interviewId}/decision-letter`
