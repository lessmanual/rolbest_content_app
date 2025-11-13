# CONTENTPILOT PROJECT STRUCTURE SUMMARY

## File Tree Overview

```
ContentPilot/
│
├── 📄 package.json                    # Dependencies & scripts
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 tailwind.config.ts             # Tailwind CSS configuration
├── 📄 postcss.config.js              # PostCSS configuration
├── 📄 vite.config.ts                 # Vite build configuration
├── 📄 drizzle.config.ts              # Drizzle ORM configuration
├── 📄 components.json                # Shadcn/UI components config
│
├── 🗂️ client/                         # FRONTEND (React + Vite)
│   ├── 📄 index.html                 # HTML entry point
│   └── src/
│       ├── 📄 App.tsx                # Main app component with routing
│       ├── 📄 main.tsx               # React DOM render entry
│       ├── 📄 index.css              # Global styles
│       ├── 🗂️ components/            # Reusable UI components
│       │   ├── 🗂️ ui/                # Radix UI based primitives
│       │   │   ├── accordion.tsx
│       │   │   ├── alert-dialog.tsx
│       │   │   ├── avatar.tsx
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── checkbox.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── dropdown-menu.tsx
│       │   │   ├── form.tsx
│       │   │   ├── input.tsx
│       │   │   ├── label.tsx
│       │   │   ├── pagination.tsx
│       │   │   ├── popover.tsx
│       │   │   ├── progress.tsx
│       │   │   ├── radio-group.tsx
│       │   │   ├── scroll-area.tsx
│       │   │   ├── select.tsx
│       │   │   ├── separator.tsx
│       │   │   ├── sheet.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── slider.tsx
│       │   │   ├── tabs.tsx
│       │   │   ├── toast.tsx
│       │   │   ├── toaster.tsx
│       │   │   ├── toggle.tsx
│       │   │   ├── toggle-group.tsx
│       │   │   ├── tooltip.tsx
│       │   │   └── ... (40+ UI components)
│       │   └── 🗂️ page/              # Page-level components
│       ├── 🗂️ pages/                 # Page components
│       │   └── dashboard.tsx         # Main dashboard page
│       ├── 🗂️ hooks/                 # Custom React hooks
│       │   └── useQuery.ts           # TanStack Query hook
│       └── 🗂️ lib/                   # Utility functions
│           ├── queryClient.ts        # TanStack Query client
│           ├── utils.ts              # Helper utilities
│           └── api.ts                # API client functions
│
├── 🗂️ server/                         # BACKEND (Express.js)
│   ├── 📄 index.ts                   # Server entry point (Express app)
│   ├── 📄 routes.ts                  # API route definitions
│   ├── 📄 storage.ts                 # Storage interface & memory impl
│   ├── 📄 vite.ts                    # Vite dev server integration
│   └── 🗂️ services/
│       └── googleSheets.ts           # Google Sheets API service
│
├── 🗂️ shared/                         # SHARED CODE
│   └── 📄 schema.ts                  # Zod schemas for validation
│
├── 🗂️ attached_assets/               # Static assets (images, fonts)
│
├── 🗂️ dist/                          # BUILD OUTPUT (generated)
│   ├── 📄 index.js                   # Bundled server (esbuild)
│   ├── 📄 index.js.map               # Source map
│   └── 🗂️ public/                    # Frontend build output
│       ├── 📄 index.html
│       └── 🗂️ assets/
│           ├── *.js (hashed)
│           └── *.css (hashed)
│
├── .replit                            # Replit deployment config
├── .gitignore                         # Git ignore rules
├── VERCEL_DEPLOYMENT_READINESS.md    # Deployment analysis (THIS DOC)
├── VERCEL_QUICK_START.md             # Quick start guide
└── PROJECT_STRUCTURE_SUMMARY.md      # This file

```

---

## ARCHITECTURE AT A GLANCE

### Frontend (React + Vite)
- **Build Tool:** Vite
- **Framework:** React 18.3.1
- **UI Library:** Radix UI components (40+ components)
- **Styling:** Tailwind CSS + CSS-in-JS
- **Routing:** Wouter (lightweight client-side router)
- **State Management:** TanStack React Query for server state
- **Forms:** React Hook Form + Zod validation
- **Output:** Static SPA (Single Page App)

### Backend (Express.js)
- **Framework:** Express.js 4.21.2
- **Language:** TypeScript (compiled to ESM)
- **Database ORM:** Drizzle ORM
- **External APIs:**
  - Google Sheets API (googleapis)
  - Make.com webhooks
  - WordPress REST API
- **Real-time:** WebSockets (ws)
- **Development:** Integrated Vite dev server
- **Output:** Node.js executable (dist/index.js)

### Database
- **Type:** PostgreSQL 16
- **ORM:** Drizzle ORM (type-safe)
- **Current:** Replit PostgreSQL
- **For Production:** Neon (recommended for Vercel)
- **Schema Location:** shared/schema.ts
- **Migrations:** drizzle-kit auto-generated

### Build System
- **Frontend Build:** Vite (`npm run build` → dist/public)
- **Backend Build:** esbuild (`npm run build` → dist/index.js)
- **Combined Build:** Both run sequentially in npm script

---

## KEY FILE DESCRIPTIONS

### `server/index.ts` - Express Server
- Sets up Express app on PORT (default 5000)
- Registers all routes via `registerRoutes()`
- In dev: integrates Vite dev server
- In prod: serves static files from `dist/public`
- Implements request logging middleware

### `server/routes.ts` - API Endpoints
- **GET /api/post** - Fetches today's post from Google Sheets
- **POST /api/post/update** - Updates post cell in sheets
- **POST /api/publish** - Triggers social media or WordPress publishing
- **GET /api/posts/published** - Gets all published posts
- Includes webhook triggering and error handling

### `server/services/googleSheets.ts` - Google Sheets Integration
- Initializes Google Auth with service account credentials
- Methods:
  - `getCurrentPost()` - Fetch today's post
  - `getPublishedPosts()` - Fetch all published posts
  - `updateCell()` - Update specific cell
  - `publishPost()` - Mark post as published
  - `publishWordPress()` - Update WordPress status
  - `publishSocialMedia()` - Update social media status

### `shared/schema.ts` - Type Definitions
- `postSchema` - Post object structure (Zod)
- `updateCellSchema` - Cell update request
- `publishSchema` - Publishing request
- TypeScript types inferred from schemas

### `client/src/App.tsx` - Main App Component
- Sets up routing with Wouter
- Wraps app with providers:
  - QueryClientProvider (TanStack React Query)
  - TooltipProvider (Radix UI)
- Two routes: `/` and `/dashboard`

### `vite.config.ts` - Vite Configuration
- Root: `client/` directory
- Output: `dist/public/`
- Path aliases for clean imports
- Includes Replit-specific plugins

### `drizzle.config.ts` - Database Configuration
- Dialect: PostgreSQL
- Requires DATABASE_URL env var
- Schema: `shared/schema.ts`
- Migrations: `migrations/` folder

---

## ENVIRONMENT VARIABLES BY FILE

| File | Variables Used |
|------|---|
| `server/index.ts` | `NODE_ENV`, `PORT` |
| `server/routes.ts` | `MAKE_WEBHOOK_URL`, `WORDPRESS_WEBHOOK_URL`, `WORDPRESS_WEBHOOK_USERNAME`, `WORDPRESS_WEBHOOK_PASSWORD` |
| `server/services/googleSheets.ts` | `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`, `GOOGLE_SHEET_ID` |
| `drizzle.config.ts` | `DATABASE_URL` |
| `vite.config.ts` | `NODE_ENV`, `REPL_ID` |

---

## DEPENDENCY GRAPH

```
┌─────────────────────────────────────┐
│   CLIENT (React + Vite)             │
│                                     │
│  ├─ React 18.3.1                   │
│  ├─ Vite 5.4.19                    │
│  ├─ TailwindCSS 3.4.17             │
│  ├─ Radix UI components            │
│  ├─ TanStack React Query           │
│  ├─ React Hook Form                │
│  ├─ Zod (validation)               │
│  └─ Wouter (routing)               │
└──────────────┬──────────────────────┘
               │ HTTP Calls
               │ (fetch to /api/*)
               ▼
┌─────────────────────────────────────┐
│   SERVER (Express.js)               │
│                                     │
│  ├─ Express 4.21.2                 │
│  ├─ TypeScript 5.6.3               │
│  ├─ Drizzle ORM 0.39.1             │
│  ├─ Google APIs 159.0.0            │
│  ├─ WebSocket (ws) 8.18.0          │
│  └─ esbuild (bundler)              │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┬──────────┬──────────┐
        ▼             ▼          ▼          ▼
    PostgreSQL  Google Sheets  Make.com  WordPress
    (Neon)      API            Webhooks   API
```

---

## BUILD & DEPLOYMENT FLOW

```
npm run build
    │
    ├─ vite build                    (Frontend)
    │   ├─ Transpiles TSX → JS
    │   ├─ Bundles with esbuild
    │   ├─ Optimizes CSS
    │   └─ Output: dist/public/
    │
    └─ esbuild server/index.ts       (Backend)
        ├─ Bundles Express app
        ├─ Transpiles TS → ESM
        ├─ Externalizes node_modules
        └─ Output: dist/index.js

npm run start
    └─ node dist/index.js
        ├─ Serves dist/public/ as static files
        ├─ Handles /api/* routes
        └─ Listens on PORT
```

---

## CODING STANDARDS

### Frontend
- Component-based architecture
- Functional components with hooks
- Tailwind for styling
- Zod for form validation
- React Query for data fetching

### Backend
- Express.js with TypeScript
- Middleware for cross-cutting concerns
- Service layer pattern
- Error handling with proper HTTP status codes
- Logging for debugging

### Shared
- Zod schemas for runtime validation
- Inferred TypeScript types
- Used by both frontend & backend

---

## MODULE RESOLUTION

Path aliases configured in `tsconfig.json`:
```typescript
"@/*": ["./client/src/*"]           // Frontend imports
"@shared/*": ["./shared/*"]         // Shared imports
```

Usage:
```typescript
// Instead of: import { Post } from '../../../shared/schema'
import { Post } from '@shared/schema'  // Clean!
```

---

## PERFORMANCE CHARACTERISTICS

| Metric | Value | Notes |
|--------|-------|-------|
| Frontend Bundle Size | ~1-2MB | After gzip compression |
| API Response Time | <100ms | Average (local) |
| Database Query Time | <50ms | Average (local) |
| Page Load Time | <2s | Vite optimized |
| TypeScript Check | ~5-10s | First run |

---

## SECURITY NOTES

1. **Environment Variables:** All secrets in env vars, not code
2. **CORS:** Will need setup for Vercel deployment
3. **Authentication:** Not currently implemented (optional feature)
4. **Validation:** Zod schemas validate all inputs
5. **Database:** Uses parameterized queries via Drizzle ORM

---

## SCALING CONSIDERATIONS

Current setup works well for:
- Small teams (1-5 developers)
- MVP/POC applications
- Low-to-medium traffic (<1000 req/min)

For scaling, consider:
- Separating frontend & backend
- Adding caching layer (Redis)
- Implementing CDN for static files
- Database connection pooling
- API rate limiting

