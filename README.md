# Research Paper Assistant

A full-stack research paper assistant with a React frontend and a Python API backend. The backend is built with FastAPI and organizes API routes, core logic, models, services, and utilities under `backend/app/`.

## Project structure

```text
frontend/       React application (Create React App structure)
backend/        FastAPI application and backend resources
  app/api/      API routes, including the upload route
  app/core/     Core application modules
  app/models/   Data models
  app/services/ Service modules
  app/utils/    Utility modules
```

## Architecture

```text
React frontend  ->  FastAPI backend  ->  API routes / services / models
```

The backend entry point is `backend/app/main.py`; the frontend is maintained separately in `frontend/`.

## Frontend development

The frontend uses Create React App. From the `frontend/` directory, the standard development command is:

```bash
npm install
npm start
```

The app runs at `http://localhost:3000` by default. Create React App's `npm run build` command creates a production build.

## Backend setup

Backend dependency and environment setup are not yet documented in this repository. Add a dependency manifest and document required environment variables before publishing backend run instructions. Do not commit credentials or real `.env` values.

## Documentation to add

Add screenshots of the frontend and document the upload flow, backend configuration, data storage, and deployment once those details are confirmed from the implementation.
