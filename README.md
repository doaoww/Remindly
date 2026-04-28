# 🧠 Remindly — Intelligent Student Learning Platform

> Transform your notes into lasting memory. Notes + AI Flashcards + Spaced Repetition.

![Version](https://img.shields.io/badge/version-1.0.0-6366f1?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [The Problem We Solve](#the-problem-we-solve)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Spaced Repetition Algorithm](#spaced-repetition-algorithm)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 About the Project

Remindly is a full-stack intelligent learning platform designed for university students, self-learners, and anyone preparing for exams. It was built to solve a real problem: students take notes but never actually retain what they've written.

Most students highlight their notes, re-read them before exams, and forget 70% within a week. Remindly changes this by combining three proven learning techniques — organized note-taking, active recall with flashcards, and spaced repetition scheduling — into one seamless experience.

**Built with:** Next.js 16, Node.js, Express, PostgreSQL, TailwindCSS, DeepSeek AI

---

## 🔥 The Problem We Solve

| Traditional studying | With Remindly |
|---------------------|---------------|
| Re-reading notes passively | Active recall with flashcards |
| Forgetting 70% within a week | 90%+ retention with spaced repetition |
| Making flashcards by hand (hours) | AI generates cards in seconds |
| No sense of progress | Visual dashboard and streak tracking |
| Notes scattered across apps | Everything in one place |

---

## ✨ Features

### 📝 Smart Notes
- Rich text editor with bold, italic, lists, and code formatting
- Custom color-coded tag system to organize by subject
- Full-text search across all your notes
- Pin important notes to the top
- Auto-save as you type

### 🃏 AI Flashcard Generation
Two generation modes:

**Pattern Matching (free, instant):**
Works when your notes follow these formats:

Photosynthesis = Process where plants convert sunlight to energy
Mitosis: Cell division producing two identical daughter cells
ATP — Adenosine triphosphate, the energy currency of cells
Q: What is DNA?
A: Deoxyribonucleic acid, carries genetic information

**AI Mode (DeepSeek):**
Works on any note format. The AI reads your notes and intelligently creates Q&A pairs covering the key concepts. No special formatting needed.

### 🔁 Spaced Repetition System
Based on the SM-2 algorithm (same used by Anki):
- Cards are scheduled based on how well you know them
- Easy cards appear less frequently, hard cards more often
- Review sessions focus only on cards due today
- Tracks `ease_factor`, `interval_days`, `repetition_count` per card

### 📊 Progress Dashboard
- Total notes and flashcards count
- Cards due for review today
- Weekly activity bar chart
- Study days streak counter
- Quick access to recent notes

### 🗂️ Folder Organization
- Flashcards grouped by the note they were generated from
- Standalone cards folder for manually created cards
- See card count and due count per folder at a glance

### 🎯 Review Mode
- One card at a time, distraction-free
- Tap to flip between question and answer
- Rate yourself: **Easy** (longer interval), **Hard** (shorter interval), **Again** (reset to tomorrow)
- Session completion screen with accuracy percentage and XP

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2 | React framework with App Router |
| TailwindCSS | 3.4 | Utility-first CSS styling |
| Zustand | 4.x | Lightweight state management |
| TipTap | 2.x | Rich text editor |
| Axios | 1.x | HTTP client with interceptors |
| Lucide React | 0.x | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24 | JavaScript runtime |
| Express | 4.19 | REST API framework |
| PostgreSQL | 16 | Relational database |
| JWT | 9.x | Authentication tokens |
| bcryptjs | 2.x | Password hashing |
| express-validator | 7.x | Input validation |
| express-rate-limit | 7.x | API rate limiting |

### AI & External Services
| Service | Purpose |
|---------|---------|
| DeepSeek API | AI flashcard generation from notes |
| Railway | Backend hosting + PostgreSQL database |
| Vercel | Frontend hosting |

---

## 📖 How to Use

### Step 1 — Create an account
Go to the app and register with your email and password. Default subject tags are created automatically.

### Step 2 — Write your first note
- Click **Notes** in the sidebar
- Click **New Note**
- Give it a title like "Biology — Chapter 3"
- Add tags like "Science" to organize it
- Write your study content in the editor

**Tips for better flashcard generation:**

Good format for Pattern Matching:
Osmosis = Movement of water through a semipermeable membrane
Diffusion: Movement of molecules from high to low concentration
Enzyme — A biological catalyst that speeds up chemical reactions
Or Q&A format:
Q: What is the powerhouse of the cell?
A: The mitochondria


### Step 3 — Generate flashcards
- Inside your note, click the **Generate** button (top right)
- Choose **Pattern Matching** for free instant generation
- Or choose **AI Generation** for smart cards from any text
- Cards appear in the side panel immediately

### Step 4 — Review your cards
- Click **Review** in the sidebar
- Cards due today are shown automatically
- Tap each card to flip it
- Rate yourself honestly:
  - ✅ **Easy** — you knew it well, see it again in many days
  - 🟡 **Hard** — you struggled, see it sooner
  - ❌ **Again** — you didn't know it, see it tomorrow

### Step 5 — Track your progress
The **Dashboard** shows:
- How many cards you've reviewed this week
- Your study streak
- Which notes you've been working on
- Cards coming up for review

---

## 📁 Project Structure

remindly/
├── README.md
├── docker-compose.yml          # Local PostgreSQL setup
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── globals.css     # Global styles + CSS variables
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── layout.tsx       # Auth guard wrapper
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── notes/page.tsx
│   │   │   │   ├── notes/[id]/page.tsx
│   │   │   │   ├── flashcards/page.tsx
│   │   │   │   └── review/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── Toast.tsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       └── AppLayout.tsx
│   │   ├── store/
│   │   │   ├── auth.store.ts
│   │   │   ├── notes.store.ts
│   │   │   └── flashcards.store.ts
│   │   └── lib/
│   │       └── api.ts          # Axios instance with interceptors
│   ├── tailwind.config.ts
│   └── package.json
│
└── backend/                    # Express REST API
├── src/
│   ├── index.js            # Entry point, middleware setup
│   ├── db/
│   │   ├── pool.js         # PostgreSQL connection pool
│   │   └── migrate.js      # Database schema migration
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── errorHandler.js # Global error handling
│   │   ├── notFound.js     # 404 handler
│   │   └── validate.js     # express-validator helper
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── notes.controller.js
│   │   ├── flashcards.controller.js
│   │   └── dashboard.controller.js
│   ├── services/
│   │   ├── auth.service.js        # Register, login, JWT
│   │   ├── notes.service.js       # CRUD + tag filtering
│   │   ├── flashcards.service.js  # Generation + SM-2 algorithm
│   │   └── dashboard.service.js   # Aggregated stats
│   └── routes/
│       ├── auth.routes.js
│       ├── notes.routes.js
│       ├── flashcards.routes.js
│       ├── dashboard.routes.js
│       └── tags.routes.js
├── .env
└── package.json

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14+ (local or cloud)
- DeepSeek API key — free at https://platform.deepseek.com

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/remindly.git
cd remindly
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/remindly
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
JWT_EXPIRES_IN=7d
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Run migrations to create all database tables:
```bash
npm run db:migrate
```

Start the development server:
```bash
npm run dev
# Backend running at http://localhost:4000
```

Test it's working:
```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"..."}
```

### 3. Set up the Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the frontend:
```bash
npm run dev
# Frontend running at http://localhost:3000
```

### 4. Open the app

Visit `http://localhost:3000`, register an account, and start studying!

---

## 📡 API Reference

All endpoints except auth require `Authorization: Bearer <token>` header.

### Authentication

POST /api/auth/register   { email, password, fullName }
POST /api/auth/login      { email, password }
GET  /api/auth/me         → current user

### Notes

GET    /api/notes              ?search=&tagId=&page=&limit=
GET    /api/notes/:id
POST   /api/notes              { title, content, tagIds[], isPinned }
PUT    /api/notes/:id          { title, content, tagIds[], isPinned }
DELETE /api/notes/:id

### Flashcards

GET    /api/flashcards         ?noteId=&dueOnly=true&page=&limit=
POST   /api/flashcards         { question, answer, noteId }
POST   /api/flashcards/generate { noteId, mode: "rule"|"ai" }
POST   /api/flashcards/:id/review { rating: "easy"|"hard"|"again" }
DELETE /api/flashcards/:id

### Tags

GET    /api/tags
POST   /api/tags               { name, color }
DELETE /api/tags/:id

### Dashboard

GET /api/dashboard → { stats, dueCards, weeklyActivity, recentNotes }

---

## 🧠 Spaced Repetition Algorithm

Remindly implements a simplified SM-2 algorithm. Each flashcard stores:

| Field | Type | Description |
|-------|------|-------------|
| `ease_factor` | decimal | Multiplier for interval growth (starts at 2.5) |
| `interval_days` | integer | Days until next review |
| `repetition_count` | integer | Times reviewed successfully |
| `next_review_date` | timestamp | When to show the card again |

**Interval progression:**

Easy answers:  1d → 3d → 7d → 14d → 30d → 60d → 120d
Hard answers:  interval × 0.6 (review sooner)
Again:         reset to 1 day

**Ease factor changes:**
- Easy: +0.15 (max 2.5)
- Hard: -0.15 (min 1.3)
- Again: -0.20 (min 1.3)

---

## 🌐 Deployment

### Backend → Railway
1. Push to GitHub
2. New Railway project → Deploy from GitHub
3. Set root directory: `backend`
4. Set start command: `node src/index.js`
5. Add environment variables (see `.env` above)
6. Add PostgreSQL service → copy `DATABASE_URL` to backend variables
7. Run `npm run db:migrate` against Railway DB
8. Generate domain in Settings → Networking

### Frontend → Vercel
1. Import GitHub repo on Vercel
2. Set root directory: `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`
4. Deploy

Auto-deploys on every push to `main` branch. ✅

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute for any purpose.

---

## 👤 Author

**Remindly** — Built for students who want to actually remember what they study, not just read it.

> *"The goal of education is not to fill a bucket but to light a fire."*

