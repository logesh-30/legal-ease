# LegalEase 🇮🇳

A full-stack web platform that helps Indian citizens navigate government document services and welfare schemes.

Built with React, TypeScript, Node.js, and MongoDB.

---

## ⚙️ Prerequisites — Install These First

Make sure you have the following installed:

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org (choose LTS version)

Verify installation:
node -v
npm -v

### 2. Git
Download from: https://git-scm.com

Verify installation:
git --version

### 3. TypeScript and ts-node
Run this after installing Node.js:
npm install -g typescript ts-node

---

## 🚀 Getting Started

### Step 1: Clone the Repository
git clone https://github.com/logesh-30/legal-ease.git
cd legal-ease

### Step 2: Install Dependencies

Open two separate terminal windows:

Terminal 1 — Backend:
cd server
npm install

Terminal 2 — Frontend:
cd client
npm install

### Step 3: Set Up Environment Variables

You will receive two .env files from the project owner on WhatsApp. Create them exactly as shared:

Create server/.env and paste the contents shared with you.
Create client/.env and paste the contents shared with you.

⚠️ Never push .env files to GitHub.

### Step 4: Run the Project

Terminal 1 — Start backend:
cd server
npm run dev

Terminal 2 — Start frontend:
cd client
npm run dev

### Step 5: Open in Browser
- User site: http://localhost:5173
- Admin panel: http://localhost:5173/admin/login
  - Email: admin@legalease.com
  - Password: Admin@123

⚠️ Do NOT run npm run seed — the database is already populated.

---

## 🗂️ Project Structure

legal-ease/
├── client/          → React frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── .env         → Frontend environment variables (do not commit)
├── server/          → Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   └── ...
│   ├── seed.ts      → Database seeder (already run, do not run again)
│   └── .env         → Backend environment variables (do not commit)
└── README.md

---

## 🛠️ Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB Atlas (cloud)
- Auth: JWT with httpOnly cookies
- Maps: Google Maps Embed API
- Voice Input: Web Speech API (browser built-in)
- Language: i18next (Tamil + English toggle)

---

## 👨‍💻 Admin Panel

Access at: http://localhost:5173/admin/login

From the admin panel you can:
- Add, edit, delete document services (with Tamil + English content)
- Add, edit, delete government schemes (with Tamil + English content)
- Add, edit, delete nearby government offices
- View and manage registered users

---

## 🤝 Collaboration Guide

### Pulling latest changes from teammates:
git pull origin main

### Pushing your changes:
git add .
git commit -m "describe what you changed"
git push origin main

### If you get a merge conflict:
- Open the conflicted file in Cursor
- Decide which changes to keep
- Then git add . and git commit again

---

## 🐛 Common Issues and Fixes

### "502 Bad Gateway" on the frontend
The backend server is not running.
Fix: Open a terminal, cd server, run npm run dev

### "Cannot connect to database"
Your MONGO_URI in server/.env is wrong or missing.
Fix: Double check the .env file contents shared with you.

### "Maps not showing"
Your VITE_GOOGLE_MAPS_EMBED_API_KEY in client/.env is wrong or missing.
Fix: Double check the .env file contents shared with you.

### "Port already in use"
Another process is using port 5000 or 5173.
Fix: Close all terminal windows and try again.

### "npm run seed was run again by mistake"
This will create duplicate data in the database.
Fix: Let the project owner know — they will clean up the database from MongoDB Atlas.

---

## 📋 Pages Overview

| Page | URL | Description |
|------|-----|-------------|
| Home | / | Hero, search, voice input, quick access cards |
| Document Services | /services | List of all government document services |
| Service Detail | /services/:id | Step by step procedure, required documents |
| Schemes | /schemes | Government welfare schemes with category filter |
| Scheme Detail | /schemes/:id | Full scheme info + eligibility checker |
| Nearby Offices | /offices | Map + list of nearby government offices |
| Login / Register | /login | Optional user account for saving favourites |
| My Saves | /saved | Saved services and schemes |
| Admin Login | /admin/login | Admin authentication |
| Admin Dashboard | /admin | Manage all content |

---

## 🔧 Backend Workflow (Detailed)

### Overview

The backend is a Node.js + Express + TypeScript REST API running on port 5000. It connects to MongoDB Atlas and exposes all data to the React frontend via JSON APIs.

```
Client (React) → HTTP Request → Express Server (port 5000) → MongoDB Atlas
```

---

### Startup Sequence

When you run `npm run dev` inside the `server/` folder:

1. `tsx watch src/index.ts` starts the server with hot-reload
2. `dotenv/config` loads environment variables from `server/.env`
3. `connectDb()` connects to MongoDB Atlas using `MONGO_URI`
4. Express app starts listening on `PORT` (default: 5000)
5. Console prints: `MongoDB connected` then `Server running on 5000`

---

### Environment Variables (server/.env)

| Variable | Purpose |
|----------|---------|
| `PORT` | Port the server listens on (5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used to sign/verify JWT tokens |
| `CLIENT_URL` | Frontend URL allowed by CORS (http://localhost:5173) |

---

### Middleware Stack

Every incoming request passes through these in order:

1. **CORS** — only allows requests from `CLIENT_URL`, with cookies enabled (`credentials: true`)
2. **express.json()** — parses JSON request bodies
3. **cookieParser()** — reads `httpOnly` cookies (used for JWT token)

---

### Authentication Flow

Auth uses JWT tokens stored in `httpOnly` cookies (not localStorage).

**Register** (`POST /api/auth/register`)
- Accepts `name`, `email`, `password`
- Hashes password with `bcrypt` (10 salt rounds)
- Creates user in MongoDB with `role: "user"`
- Signs a JWT (HS256, expires in 7 days) and sets it as an `httpOnly` cookie
- Returns `{ token, user }` in response

**Login** (`POST /api/auth/login`)
- Accepts `email`, `password`
- Finds user by email, compares password hash with `bcrypt`
- Signs a new JWT and sets cookie
- Returns `{ token, user }`

**Logout** (`POST /api/auth/logout`)
- Clears the `token` cookie

**Get Current User** (`GET /api/auth/me`)
- Requires valid JWT (via cookie or `Authorization: Bearer <token>` header)
- Returns user object without `passwordHash`

**JWT Middleware** (`requireAuth`)
- Reads token from `Authorization` header or cookie
- Verifies using `jose` library with `JWT_SECRET`
- Attaches `{ id, role }` to `req.user`
- Returns `401` if token is missing or invalid

**Admin Middleware** (`requireAdmin`)
- Runs after `requireAuth`
- Checks `req.user.role === "admin"`
- Returns `403` if not admin

---

### Database Models

**User**
- `name`, `email`, `passwordHash`, `role` (user/admin)
- `savedServices[]` — references to Service documents
- `savedSchemes[]` — references to Scheme documents
- `eligibilityProfile` — embedded sub-document (age, gender, income, etc.)

**Service** (Government Document Services)
- Bilingual fields: `nameEn`, `nameTa`, `descriptionEn`, `descriptionTa`
- `stepsEn[]`, `stepsTa[]` — step-by-step procedure
- `documentsEn[]`, `documentsTa[]` — required documents list
- `legalDetailsEn`, `legalDetailsTa` — legal reference info
- `officialPortalUrl` — link to government portal
- `icon` — icon identifier for UI

**Scheme** (Government Welfare Schemes)
- Bilingual fields: `nameEn`, `nameTa`, `eligibilityEn`, `eligibilityTa`, `benefitsEn`, `benefitsTa`, `howToApplyEn`, `howToApplyTa`
- `category` — one of: Education, Business, Financial, Health, Agriculture
- `eligibilityRules` — structured rules (ageMin, ageMax, incomeMax, categories, occupations, genders, tags)
- `documentsEn[]`, `documentsTa[]`
- `officialLink`

**Office** (Nearby Government Offices)
- `name`, `address`, `latitude`, `longitude`
- `workingHours`, `servicesOffered[]`

**Eligibility** (User Eligibility Profile — separate collection)
- Linked to User via `userId` (one-to-one)
- Sections: Personal (age, gender, maritalStatus), Location (state, district, areaType), Income (annualIncome, isBPL), Occupation, Education, Social (category, isMinority), Family (familySize, earningMembers), Special flags (isSeniorCitizen, isWidow, isDifferentlyAbled, isFarmer, isStudent)

---

### API Routes Reference

#### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, get JWT cookie |
| POST | `/logout` | No | Clear JWT cookie |
| GET | `/me` | Yes | Get logged-in user |

#### Services — `/api/services`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all document services |
| GET | `/:id` | No | Get single service by ID |
| POST | `/` | Admin | Create new service |
| PUT | `/:id` | Admin | Update service |
| DELETE | `/:id` | Admin | Delete service |

#### Schemes — `/api/schemes`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all welfare schemes |
| GET | `/:id` | No | Get single scheme by ID |
| POST | `/` | Admin | Create new scheme |
| PUT | `/:id` | Admin | Update scheme |
| DELETE | `/:id` | Admin | Delete scheme |

#### Offices — `/api/offices`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all government offices |
| POST | `/` | Admin | Add new office |
| PUT | `/:id` | Admin | Update office |
| DELETE | `/:id` | Admin | Delete office |

#### Saves — `/api/save` or `/api/saves`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get user's saved services and schemes |
| POST | `/` | Yes | Save a service or scheme (`{ type, itemId }`) |
| DELETE | `/` | Yes | Unsave a service or scheme (`{ type, itemId }`) |

#### Eligibility — `/api`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/eligibility` | Yes | Submit/update eligibility profile |
| GET | `/eligibility` | Yes | Get saved eligibility profile |
| GET | `/eligible-schemes` | Yes | Get schemes matched to user's profile |

#### Users — `/api/users` (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all users |
| PUT | `/:id` | Admin | Update user (name, email, role) |
| DELETE | `/:id` | Admin | Delete user |
| POST | `/save/:type/:id` | Yes | Save item to user profile |
| GET | `/saved` | Yes | Get user's saved items |

#### Admin Stats — `/api/admin`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | Get counts: services, schemes, offices, users |

#### Health Check
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Returns `{ ok: true }` — confirms server is up |

---

### Eligibility Matching Logic

When `GET /api/eligible-schemes` is called:

1. Loads the user's saved `Eligibility` profile from MongoDB
2. Fetches all schemes from the database
3. For each scheme, runs `matchScheme()` against the user's profile:
   - Parses `eligibilityEn` text using regex to extract rules
   - Checks: income limit, age range, caste category, gender, occupation (farmer/student/business/worker), special conditions (BPL, widow, disabled, senior citizen)
   - Each check is independent — a scheme only fails if it explicitly requires something the user doesn't meet
   - Returns `{ eligible: boolean, reasons: string[] }`
4. Filters to only eligible schemes
5. Sorts by number of matched reasons (best match first)
6. Returns the matched schemes with `matchedReasons[]` attached

---

### Request/Response Flow Examples

**User visits /services page:**
```
GET http://localhost:5000/api/services
→ No auth required
→ Returns array of all Service documents sorted by createdAt desc
```

**User logs in:**
```
POST http://localhost:5000/api/auth/login
Body: { email, password }
→ bcrypt compares password
→ JWT signed with JWT_SECRET (7 day expiry)
→ Cookie set: token=<jwt> (httpOnly, sameSite=lax)
→ Returns: { token, user: { id, name, email, role } }
```

**User saves a scheme:**
```
POST http://localhost:5000/api/save
Cookie: token=<jwt>
Body: { type: "scheme", itemId: "<schemeId>" }
→ requireAuth verifies JWT
→ $addToSet adds schemeId to user.savedSchemes
→ Returns: { message: "Saved" }
```

**Admin creates a service:**
```
POST http://localhost:5000/api/services
Cookie: token=<admin-jwt>
Body: { nameEn, nameTa, descriptionEn, ... }
→ requireAuth verifies JWT
→ requireAdmin checks role === "admin"
→ Service.create(req.body) saves to MongoDB
→ Returns: created Service document (201)
```

---

## 📞 Contact

For .env files or any setup issues, contact the project owner directly.
