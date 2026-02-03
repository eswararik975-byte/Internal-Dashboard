# Internal Dashboard

Simple internal dashboard for small IT companies (10–100 employees).

## What it covers
- Track projects.
- Track daily work logs.
- Give managers a lightweight overview.

## Stack
- **Frontend:** Angular (standalone components).
- **Backend:** Node.js + Express.
- **Database:** PostgreSQL.
- **Auth:** Email + password (JWT).

## Local setup

### Database
1. Create a PostgreSQL database called `internal_dashboard`.
2. Run the schema:
   ```bash
   psql -d internal_dashboard -f backend/db/schema.sql
   ```

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Deploying
- Frontend: deploy the `frontend` app to Render/Railway.
- Backend: deploy the `backend` app with `DATABASE_URL` + `JWT_SECRET`.
- Database: use a managed Postgres instance (Render/Railway free tier).
