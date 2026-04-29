🌿 Remindly — Intelligent Student Learning Platform

> Turn your notes into lasting memory. AI-powered flashcards + spaced repetition, all in one place.

🔗 **Live:** [remindly.vercel.app](https://remindly-sigma.vercel.app/)

---

## 📖 How the App Works

### For Students

**1. Create your notes**
Go to `/notes` and click **"New Note"**. Give it a title like *"Biology — Chapter 3"* and start writing in the rich text editor. Add color-coded tags to organize by subject (Mathematics, Science, History, Languages — or create your own).

**2. Generate flashcards automatically**
Open any note and click **"Generate"** in the top toolbar. Choose your method:

**Pattern Matching (free, instant)** — works when your notes follow these formats:
```
Photosynthesis = Process where plants convert sunlight to energy
Mitosis: Cell division producing two identical daughter cells
ATP — Adenosine triphosphate, the energy currency of cells
Q: What is DNA?
A: Deoxyribonucleic acid, carries genetic information
1. Osmosis - Movement of water through a semipermeable membrane
```

**AI Generation (Gemini)** — works on any note format. The AI reads your notes and intelligently creates Q&A flashcards covering the key concepts. No special formatting needed.

Generated cards appear instantly in the side panel. Duplicate cards are automatically skipped.

**3. Review your cards**
Click **"Review"** in the sidebar. Cards due today are loaded automatically. Tap each card to flip it, then rate yourself honestly:
- ✅ **Easy** — you knew it well, see it again in many days
- 🟡 **Hard** — you struggled, see it sooner
- ❌ **Again** — you didn't know it, see it tomorrow

The algorithm schedules your next review automatically.

**4. Track your progress**
The **Dashboard** shows:
- Total notes and flashcards
- Cards due for review today
- Weekly activity bar chart (reviews per day)
- Study days counter
- Quick links to recent notes

**5. Organize with folders**
In the **Flashcards** page, cards are grouped into folders by the note they were generated from. Each folder shows a preview of questions and how many cards are due. Click a folder to see all its cards.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| State Management | Zustand |
| Rich Text Editor | TipTap |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Authentication | JWT + bcryptjs |
| AI Generation | Gemini API |
| Deployment (Frontend) | Vercel |
| Deployment (Backend) | Railway |

---

## ✨ Features

- Rich text note editor with bold, italic, lists, and code formatting
- Custom color-coded tag system to organize notes by subject
- Full-text search across all notes
- Pin important notes to the top
- Auto-save as you type (1.5s debounce)
- AI flashcard generation via Gemini — works on any note format
- Pattern matching generation — free and instant, no API key needed
- Duplicate card detection — never generates the same card twice
- Flashcard folders — cards grouped by their source note
- SM-2 spaced repetition algorithm (same as Anki)
- Review mode with animated flip cards
- Easy / Hard / Again rating system
- Session completion screen with accuracy ring chart and XP
- Weekly activity bar chart on dashboard
- JWT authentication with bcrypt password hashing
- Toast notifications for all errors and successes
- Responsive dark glassmorphism UI
- Privacy Policy and Terms of Service pages
- Landing page with pricing, features, and testimonials

---

## 📁 Project Structure

```
remindly/
├── README.md
├── docker-compose.yml              # Local PostgreSQL (optional)
│
├── frontend/                       # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── layout.tsx          # Root layout + metadata
│   │   │   ├── globals.css         # Global styles + CSS variables
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (app)/
│   │   │   │   ├── layout.tsx      # Auth guard
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
│   │   │   │   └── Toast.tsx       # Global toast notifications
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       └── AppLayout.tsx   # Auth check + layout wrapper
│   │   ├── store/
│   │   │   ├── auth.store.ts       # Login, register, logout, persist
│   │   │   ├── notes.store.ts      # CRUD + tag filtering + search
│   │   │   └── flashcards.store.ts # Generate, review, delete
│   │   └── lib/
│   │       └── api.ts              # Axios instance with JWT interceptor
│   ├── tailwind.config.ts
│   ├── .env.local
│   └── package.json
│
└── backend/                        # Express REST API
    ├── src/
    │   ├── index.js                # Entry point, CORS, rate limiting
    │   ├── db/
    │   │   ├── pool.js             # PostgreSQL connection pool
    │   │   └── migrate.js          # Full schema with indexes + triggers
    │   ├── middleware/
    │   │   ├── auth.js             # JWT verification middleware
    │   │   ├── errorHandler.js     # Friendly error messages
    │   │   ├── notFound.js         # 404 handler
    │   │   └── validate.js         # express-validator helper
    │   ├── controllers/
    │   │   ├── auth.controller.js
    │   │   ├── notes.controller.js
    │   │   ├── flashcards.controller.js
    │   │   └── dashboard.controller.js
    │   ├── services/
    │   │   ├── auth.service.js        # Register, login, bcrypt, JWT
    │   │   ├── notes.service.js       # CRUD + tag junction + pagination
    │   │   ├── flashcards.service.js  # SM-2 algorithm + AI generation
    │   │   └── dashboard.service.js   # Aggregated stats queries
    │   └── routes/
    │       ├── auth.routes.js
    │       ├── notes.routes.js
    │       ├── flashcards.routes.js
    │       ├── dashboard.routes.js
    │       └── tags.routes.js
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js 18+
- PostgreSQL database — local or free tier at [railway.app](https://railway.app)
- Gemini API key — free $5 credit at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repository

```bash
git clone https://github.com/doaoww/Remindly.git
cd Remindly
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
GEMINI_API_KEY=sk-your-gemini-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Run database migrations:

```bash
npm run db:migrate
```

Start the backend:

```bash
npm run dev
# Running at http://localhost:4000
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
# Running at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), register an account, and start studying!

---

## 🌐 Deploying to Production

### Backend → Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Set root directory: `backend`
4. Set start command: `node src/index.js`
5. Add a **PostgreSQL** service → copy its `DATABASE_URL`
6. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Railway PostgreSQL URL |
| `JWT_SECRET` | Random 32+ char string |
| `JWT_EXPIRES_IN` | `7d` |
| `GEMINI_API_KEY` | From aistudio.google.com |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `PORT` | `4000` |

7. Run migrations against Railway DB:
```bash
# Temporarily set DATABASE_URL in local .env to Railway URL, then:
npm run db:migrate
```
8. Generate domain in **Settings → Networking**

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo
2. Set root directory: `frontend`
3. Add environment variable:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app/api` |

4. Click **Deploy**

Auto-deploys on every push to `main`. ✅

---

## 📡 API Reference

All endpoints except auth require `Authorization: Bearer <token>` header.

### Authentication
```
POST /api/auth/register    { email, password, fullName }
POST /api/auth/login       { email, password }
GET  /api/auth/me          → current user info
```

### Notes
```
GET    /api/notes              ?search=&tagId=&page=&limit=
GET    /api/notes/:id
POST   /api/notes              { title, content, tagIds[], isPinned }
PUT    /api/notes/:id          { title, content, tagIds[], isPinned }
DELETE /api/notes/:id
```

### Flashcards
```
GET    /api/flashcards              ?noteId=&dueOnly=true&page=&limit=
POST   /api/flashcards              { question, answer, noteId }
POST   /api/flashcards/generate     { noteId, mode: "rule"|"ai" }
POST   /api/flashcards/:id/review   { rating: "easy"|"hard"|"again" }
DELETE /api/flashcards/:id
```

### Tags
```
GET    /api/tags
POST   /api/tags               { name, color }
DELETE /api/tags/:id
```

### Dashboard
```
GET /api/dashboard → { stats, dueCards, weeklyActivity, recentNotes }
```

---

## 🧠 Spaced Repetition Algorithm

Remindly implements the **SM-2 algorithm** — the same one used by Anki. Each flashcard stores:

| Field | Type | Description |
|-------|------|-------------|
| `ease_factor` | decimal | Multiplier for interval growth (default 2.5) |
| `interval_days` | integer | Days until next review |
| `repetition_count` | integer | Number of successful reviews |
| `next_review_date` | timestamp | Exact date to show the card again |
| `last_review_date` | timestamp | When it was last reviewed |

**How intervals grow:**
```
Easy answers:  1d → 3d → 7d → 14d → 30d → 60d → 120d
Hard answers:  current interval × 0.6 (see it sooner)
Again:         reset to 1 day (start over)
```

**Ease factor adjustments per rating:**
- Easy: +0.15 (max 2.5) — card gets easier to schedule
- Hard: −0.15 (min 1.3) — card needs more frequent review
- Again: −0.20 (min 1.3) — significant penalty

---

## 🗃 Database Schema

```sql
users         — id, email, password_hash, full_name, created_at
notes         — id, user_id, title, content, is_pinned, created_at, updated_at
tags          — id, user_id, name, color
note_tags     — note_id, tag_id (junction table)
flashcards    — id, user_id, note_id, question, answer,
                ease_factor, interval_days, repetition_count,
                last_review_date, next_review_date
review_history — id, user_id, flashcard_id, rating, reviewed_at
```

---

## 📝 Available Scripts

### Backend
```bash
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server
npm run db:migrate   # Create/update database tables
```

### Frontend
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## 👩‍💻 Author

**doaoww** — [github.com/doaoww](https://github.com/doaoww)

Built as a full-stack portfolio project demonstrating Next.js App Router, Express REST API, PostgreSQL with raw SQL, JWT authentication, SM-2 spaced repetition algorithm, and AI integration with Gemini API.