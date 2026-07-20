# LanguageLearning

LanguageLearning is a gamified Japanese learning platform built as a full-stack monorepo. It combines an interactive React frontend, a TypeScript/Express backend, and a Python scheduler service to support lessons, practice tools, audio features, spaced repetition, authentication, and progress tracking.

## Overview

The application is organized into three cooperating parts:

- `Frontend/` provides the public learning experience, game pages, dashboard, theme system, and interactive 3D home experience.
- `Backend/node/` powers authentication, grammar checks, transcription and TTS endpoints, session handling, and audio generation.
- `Backend/python/Scheduler/` provides scheduling logic for spaced repetition workflows and card selection.

## Features

### Learning Experience

- Interactive home page with light/dark theme support.
- 3D Spline-based hero animation on the landing page.
- Dashboard with streak tracking and themed sidebar navigation.
- Storybook-style reading experience.
- Flashcard-oriented learning flows and reading utilities.
- Game pages for practice and engagement.

### Language Tools

- Text-to-speech support for Japanese audio playback.
- Audio and transcription-related backend routes.
- Grammar checking endpoint for language practice.
- Session-based authentication and user management.

### Platform Capabilities

- MongoDB-backed user and stats storage through Prisma.
- Redis-backed session persistence.
- Sentry instrumentation for backend error tracking.
- Python scheduler endpoints for review and card initialization.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Recoil, Spline
- Backend: Node.js, Express, TypeScript, Prisma, MongoDB, Redis, Socket.IO, OpenAI
- Scheduler: Python, FastAPI, Uvicorn, Pandas, NumPy, fsrs-style scheduling utilities

## Repository Structure

```text
LanguageLearning/
├── Backend/
│   ├── node/
│   │   ├── prisma/
│   │   └── src/
│   └── python/
│       └── Scheduler/
├── Frontend/
└── README.md
```

### Frontend Highlights

- `src/pages/Home.tsx` - landing page, theme toggle, and 3D hero.
- `src/pages/Darshboard.tsx` - dashboard shell and summary cards.
- `src/components/Dashboard/` - sidebar, streak panel, and supporting widgets.
- `src/components/` - shared UI pieces for navigation, translation, story reading, and mini features.

### Backend Highlights

- `src/index.ts` - Express entrypoint and API bootstrap.
- `src/routes/` - API route grouping for auth, grammar checks, and transcription.
- `src/apis/` - OpenAI/audio/grammar service handlers.
- `src/controllers/` - authentication and chat controllers.
- `prisma/schema.prisma` - MongoDB schema for users and user stats.

### Scheduler Highlights

- `app.py` - FastAPI entrypoint.
- `schema/` - request and response contracts.
- `utils/` - scheduling and review helpers.
- `testers/` - local experiments and timing checks.

## Prerequisites

- Node.js 18 or newer
- npm
- Python 3.10 or newer
- MongoDB database
- Redis or Upstash Redis account
- OpenAI API key for audio and transcription features
- Sentry DSN if you want backend error tracking enabled

## Environment Variables

### Backend Node

Create a `.env` file in `Backend/node/` with:

```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="your-jwt-secret"
REDIS_TOKEN="your-upstash-token"
OPENAI_API_KEY="your-openai-api-key"
SENTRY_DSN="your-sentry-dsn"
```

### Python Scheduler

The scheduler currently runs without a required environment file, but you can add one if your deployment needs it.

## Getting Started

### 1. Install dependencies

Install each service separately:

```bash
cd Frontend
npm install

cd ../Backend/node
npm install

cd ../python/Scheduler
pip install -r requirements.txt
```

### 2. Run the frontend

```bash
cd Frontend
npm run dev
```

The Vite app runs on the default local dev port.

### 3. Run the Node backend

```bash
cd Backend/node
npm run dev
```

The API server starts on port `3000` and also launches the audio batch service on port `4000`.

### 4. Run the Python scheduler

```bash
cd Backend/python/Scheduler
uvicorn app:app --reload
```

## Available Scripts

### Frontend

- `npm run dev` - start the Vite dev server.
- `npm run build` - type-check and build the production bundle.
- `npm run lint` - run ESLint.
- `npm run preview` - preview a production build locally.

### Backend Node

- `npm run dev` - start the TypeScript backend with hot reload.
- `npm run build` - compile TypeScript to `dist/`.
- `npm run start` - run the compiled server.
- `npm run prisma:generate` - generate Prisma client code.
- `npm run prisma:migrate` - run Prisma migration workflow.

## API Summary

### Node Backend

Base path: `/api/v1`

- `POST /users/signup` - create an account.
- `POST /users/login` - authenticate a user.
- `POST /users/logout` - invalidate the active session.
- `GET /users/sessions` - list active sessions.
- `POST /users/logout-others` - revoke other sessions.
- `POST /check` - grammar checking endpoint.
- `POST /audio&textcomms/TTS` - text-to-speech generation.
- `GET /audio&textcomms/` - transcription service health/info route.

### Python Scheduler

- `GET /` - health or welcome response.
- `GET /health` - health check.
- `POST /initialize` - create an initial scheduler state.
- `POST /review` - update scheduling after review.
- `POST /getCards` - fetch cards for the next review cycle.

## Screenshots

The repository includes prototype screenshots and an architecture image:

- [LangApp Architecture.png](LangApp%20Architecture.png)
- [Home.png](Home.png)
- [Game1.png](Game1.png)
- [Game2.png](Game2.png)

## Notes

- The frontend uses a shared theme system, so light and dark mode should be managed globally rather than per-page.
- The home page uses a Spline embed for the 3D hero, so the scene URL can be swapped later if you want a different exported asset.
- The backend relies on MongoDB and Redis for persistence, so those services must be reachable before authentication flows will work.

## License

No explicit license has been provided in the repository.
