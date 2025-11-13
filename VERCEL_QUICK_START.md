# VERCEL DEPLOYMENT QUICK START GUIDE
## ContentPilot Application

**TL;DR:** Express.js is NOT Vercel-compatible. Choose one option below and follow the steps.

---

## OPTION COMPARISON MATRIX

| Aspect | Option A (Next.js) | Option B (Separate) | Option D (Railway) |
|--------|---|---|---|
| **Vercel Compatible** | ✅ Native | ✅ Yes | ❌ No |
| **Development Time** | 3-5 days | 2-3 days | 1 day |
| **Complexity** | HIGH | MEDIUM | LOW |
| **Cost** | FREE (Vercel) | MEDIUM (Railway $5+) | MEDIUM (Railway $5+) |
| **Best For** | Full migration | Quick deployment | No code changes |
| **Keep Express** | ❌ No | ✅ Yes | ✅ Yes |

---

## QUICK DECISION TREE

```
Do you want Vercel?
├─ YES, and have 3-5 days?
│  └─> OPTION A: Migrate to Next.js ✅
│
├─ YES, and need it done fast?
│  └─> OPTION B: Split Frontend + Backend ✅
│
└─ Don't care about Vercel?
   └─> OPTION D: Use Railway (1 day) ✅✅✅
```

---

## OPTION B CHECKLIST (RECOMMENDED - 2-3 days)

### What You'll Do
- Keep Express backend as-is
- Deploy frontend (React + Vite) to Vercel
- Deploy backend (Express) to Railway/Render
- Add CORS headers to Express

### Step 1: Prepare Frontend (30 min)
```bash
# Create vercel.json for frontend deployment
touch vercel.json

# Update package.json to build only frontend
# Change build script from:
#   "build": "vite build && esbuild ..."
# To:
#   "build": "vite build"
```

### Step 2: Create vercel.json (30 min)
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Step 3: Add CORS to Express (1 hour)
```typescript
// In server/index.ts, add after express.json():
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Update API calls in frontend to use BACKEND_URL
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
```

### Step 4: Deploy Backend to Railway (1-2 hours)
```bash
# 1. Sign up at railway.app
# 2. Create new project
# 3. Connect GitHub repo
# 4. Add environment variables from Vercel
# 5. Deploy!
```

### Step 5: Deploy Frontend to Vercel (30 min)
```bash
# 1. Sign up/login to vercel.com
# 2. Import GitHub repo
# 3. Add environment variable:
#    VITE_API_URL = https://your-railway-app.railway.app
# 4. Deploy!
```

### Environment Variables Needed

**Vercel (Frontend):**
```
VITE_API_URL=https://your-railway-backend.railway.app
```

**Railway (Backend):**
```
DATABASE_URL=postgresql://user:pass@host/db
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type": "..."}
GOOGLE_SHEET_ID=1abc...xyz
MAKE_WEBHOOK_URL=https://...
WORDPRESS_WEBHOOK_URL=https://...
WORDPRESS_WEBHOOK_USERNAME=username
WORDPRESS_WEBHOOK_PASSWORD=password
PORT=5000
NODE_ENV=production
```

---

## OPTION A CHECKLIST (FULL MIGRATION - 3-5 days)

**NOT RECOMMENDED FOR THIS PROJECT** - Express routes are minimal, but migration overhead is still significant.

If you choose this, see full report for detailed migration steps.

---

## OPTION D CHECKLIST (RAILWAY - 1 day)

### Best If You Don't Need Vercel

```bash
# 1. Install railway CLI
npm install -g @railway/cli

# 2. Login and initialize project
railway login
railway init

# 3. Deploy!
railway up

# 4. Set environment variables in Railway dashboard
# (No code changes needed!)
```

**Pros:**
- Zero code changes
- 1 day deployment
- Same Express server works as-is

**Cons:**
- Not using Vercel
- $5+/month for backend

---

## ENVIRONMENT VARIABLES CHECKLIST

Before deploying to ANY platform, gather these:

- [ ] `DATABASE_URL` - from your PostgreSQL provider (Neon recommended)
- [ ] `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` - JSON from Google Cloud
- [ ] `GOOGLE_SHEET_ID` - from your Google Sheet URL
- [ ] `MAKE_WEBHOOK_URL` - from Make.com integration
- [ ] `WORDPRESS_WEBHOOK_URL` - your WordPress webhook endpoint
- [ ] `WORDPRESS_WEBHOOK_USERNAME` - WordPress username
- [ ] `WORDPRESS_WEBHOOK_PASSWORD` - WordPress password

---

## DATABASE SETUP

### For Vercel + Railway Option (OPTION B)

**Use Neon (Recommended):**
```bash
# 1. Go to neon.tech
# 2. Sign up (free tier includes good usage)
# 3. Create new project
# 4. Copy DATABASE_URL
# 5. Set in both Vercel and Railway env vars
```

**Why Neon?**
- ✅ Serverless PostgreSQL
- ✅ Built for Vercel
- ✅ Auto-scaling
- ✅ Generous free tier

---

## COMMON ERRORS & FIXES

### "Express listening on undefined port"
**Fix:** Add to Vercel env vars:
```
PORT=3000
```

### "DATABASE_URL not found"
**Fix:** Set in your deployment platform's environment variables
(not as .env file!)

### "CORS error: Origin not allowed"
**Fix:** Update `FRONTEND_URL` in Railway env vars with your Vercel domain

### "Google Sheets service not initialized"
**Fix:** Ensure `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` is valid JSON string
(no line breaks - should be all on one line)

---

## DEPLOYMENT CHECKLIST

- [ ] Choose your option (B recommended)
- [ ] Gather all environment variables
- [ ] Test build locally: `npm run build`
- [ ] Create database on Neon
- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Add environment variables to each platform
- [ ] Test API connectivity
- [ ] Test Google Sheets integration
- [ ] Test webhook publishing
- [ ] Monitor first 24 hours

---

## NEED HELP?

### For Option B Setup
Check full `VERCEL_DEPLOYMENT_READINESS.md` - Sections 9-11

### For Environment Variables
Check full report - Section 4

### For API Routes
Check full report - Section 6

---

## ESTIMATED TIMELINE

**Option B (Recommended):**
- Day 1: Setup & configuration (4 hours)
- Day 2: Testing & debugging (4 hours)
- Day 3: Production deployment (2 hours)
- **Total: 2-3 days**

**Option D (Easiest):**
- Day 1: Deploy to Railway (2-3 hours)
- **Total: 1 day**

---

## AFTER DEPLOYMENT

### Monitor These
1. ✅ API response times (should be < 1s)
2. ✅ Database connection errors
3. ✅ Google Sheets API rate limits
4. ✅ Webhook failures
5. ✅ Frontend build size (should be < 1MB)

### Setup Error Tracking
```bash
npm install @sentry/react
# Configure in your frontend

npm install @sentry/node
# Configure in your backend
```

---

## SUCCESS = ✅

Your app is ready when:
- [ ] Frontend loads without errors
- [ ] API calls return data
- [ ] Google Sheets integration works
- [ ] Webhooks trigger successfully
- [ ] Database saves/retrieves data
- [ ] No 404 errors on API routes
