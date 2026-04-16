# Backend Contributions — LegalEase

This document outlines how the backend work is divided between the two team members.

---

## 👤 Member 1 — Authentication, Users & Server Setup

### Files Owned
- `server/src/index.ts` — Server entry point
- `server/src/config/db.ts` — MongoDB connection
- `server/src/utils/jwt.ts` — JWT token creation and cookie helper
- `server/src/middleware/auth.ts` — requireAuth and requireAdmin middleware
- `server/src/routes/authRoutes.ts` — Register, Login, Logout, Get current user
- `server/src/routes/userRoutes.ts` — Admin user management, saved items
- `server/src/routes/adminRoutes.ts` — Admin dashboard stats
- `server/src/models/User.ts` — User schema

---

### What You Did & How to Explain It

#### 1. Server Setup (`index.ts`, `db.ts`)
You set up the entire Express server from scratch.

- Configured **CORS** to only allow requests from the frontend (`http://localhost:5173`) with cookies enabled
- Added `express.json()` to parse request bodies and `cookieParser()` to read JWT cookies
- Called `connectDb()` on startup which uses Mongoose to connect to MongoDB Atlas
- Registered all route files under their respective `/api/...` paths
- Used `tsx watch` for hot-reload during development

**How to explain:** "I initialized the Express server, configured middleware like CORS and cookie parsing, and wired up all the route modules. I also wrote the MongoDB connection logic using Mongoose."

---

#### 2. JWT Utility (`jwt.ts`)
You wrote the token creation and cookie-setting helpers used across the entire auth system.

- `createToken()` — signs a JWT using the `jose` library with HS256 algorithm, embeds `{ id, role }`, expires in 7 days
- `setAuthCookie()` — sets the token as an `httpOnly`, `sameSite=lax` cookie so it's secure and not accessible via JavaScript

**How to explain:** "I wrote the JWT utility that signs tokens and sets them as secure httpOnly cookies. This prevents XSS attacks since JavaScript can't read the token."

---

#### 3. Auth Middleware (`auth.ts`)
You wrote the two middleware functions that protect all private routes.

- `requireAuth` — reads token from `Authorization` header or cookie, verifies it using `jose`, attaches `{ id, role }` to `req.user`, returns 401 if invalid
- `requireAdmin` — runs after requireAuth, checks if `req.user.role === "admin"`, returns 403 if not

**How to explain:** "I wrote the authentication middleware. Every protected route passes through requireAuth which verifies the JWT. Admin routes additionally pass through requireAdmin which checks the user's role."

---

#### 4. Auth Routes (`authRoutes.ts`)
You built the full authentication API.

- `POST /api/auth/register` — validates input, hashes password with bcrypt (10 rounds), creates user, returns JWT cookie
- `POST /api/auth/login` — finds user by email, compares password hash with bcrypt, returns JWT cookie
- `POST /api/auth/logout` — clears the token cookie
- `GET /api/auth/me` — returns the logged-in user's data (without passwordHash)

**How to explain:** "I built the full auth system — register, login, logout, and get current user. Passwords are never stored in plain text, I used bcrypt hashing. The JWT is stored in an httpOnly cookie instead of localStorage for security."

---

#### 5. User & Admin Routes (`userRoutes.ts`, `adminRoutes.ts`)
You built the admin-facing user management API and the dashboard stats endpoint.

- List all users (excluding passwordHash)
- Update a user's name, email, or role
- Delete a user
- Save/unsave items to a user's profile
- `GET /api/admin/stats` — returns counts of services, schemes, offices, and users using `Promise.all` for parallel DB queries

**How to explain:** "I built the user management API for the admin panel — listing, updating, and deleting users. I also built the stats endpoint that fetches counts from all collections in parallel using Promise.all."

---

#### 6. User Model (`models/User.ts`)
You designed the User schema in MongoDB.

- Fields: `name`, `email`, `passwordHash`, `role` (user/admin)
- `savedServices[]` and `savedSchemes[]` — arrays of ObjectId references to Service and Scheme documents
- `eligibilityProfile` — embedded sub-document storing basic eligibility info

**How to explain:** "I designed the User model. It stores a hashed password, the user's role, and references to their saved services and schemes using MongoDB ObjectId references."

---

## 👤 Member 2 — Core Features, Schemes, Eligibility & Offices

### Files Owned
- `server/src/routes/serviceRoutes.ts` — Document services CRUD
- `server/src/routes/schemeRoutes.ts` — Welfare schemes CRUD
- `server/src/routes/officeRoutes.ts` — Government offices CRUD
- `server/src/routes/saveRoutes.ts` — Save/unsave services and schemes
- `server/src/routes/eligibilityRoutes.ts` — Eligibility form + scheme matching logic
- `server/src/models/Service.ts` — Service schema
- `server/src/models/Scheme.ts` — Scheme schema
- `server/src/models/Office.ts` — Office schema
- `server/src/models/Eligibility.ts` — Eligibility schema

---

### What You Did & How to Explain It

#### 1. Service Routes & Model (`serviceRoutes.ts`, `models/Service.ts`)
You built the API for government document services and designed the schema.

- `GET /api/services` — returns all services sorted by newest first
- `GET /api/services/:id` — returns a single service by ID
- `POST /api/services` — admin only, creates a new service
- `PUT /api/services/:id` — admin only, updates a service
- `DELETE /api/services/:id` — admin only, deletes a service

Schema fields: `nameEn`, `nameTa`, `descriptionEn`, `descriptionTa`, `stepsEn[]`, `stepsTa[]`, `documentsEn[]`, `documentsTa[]`, `legalDetailsEn`, `legalDetailsTa`, `officialPortalUrl`, `icon`

**How to explain:** "I built the services API with full CRUD. The schema supports bilingual content — every field has an English and Tamil version. Public users can read, only admins can create, update, or delete."

---

#### 2. Scheme Routes & Model (`schemeRoutes.ts`, `models/Scheme.ts`)
You built the API for government welfare schemes.

- Same CRUD pattern as services
- Schema includes `category` (Education, Business, Financial, Health, Agriculture)
- `eligibilityRules` — structured object with ageMin, ageMax, incomeMax, categories, occupations, genders, tags
- Bilingual fields for eligibility, benefits, and how-to-apply content

**How to explain:** "I built the schemes API. Each scheme has structured eligibility rules stored in the database, plus bilingual text fields. The category field allows the frontend to filter schemes by type."

---

#### 3. Office Routes & Model (`officeRoutes.ts`, `models/Office.ts`)
You built the API for nearby government offices shown on the map.

- `GET /api/offices` — returns all offices
- Admin routes to add, update, delete offices
- Schema fields: `name`, `address`, `latitude`, `longitude`, `workingHours`, `servicesOffered[]`

**How to explain:** "I built the offices API. Each office stores GPS coordinates (latitude/longitude) which the frontend uses with Google Maps to show offices near the user."

---

#### 4. Save Routes (`saveRoutes.ts`)
You built the save/unsave feature that lets logged-in users bookmark services and schemes.

- `POST /api/save` — uses MongoDB `$addToSet` to add an item to savedServices or savedSchemes without duplicates
- `DELETE /api/save` — uses `$pull` to remove an item
- `GET /api/save` — populates and returns the full saved service and scheme documents, plus their IDs separately for easy frontend checks

**How to explain:** "I built the bookmarking system. I used MongoDB's $addToSet operator so the same item can't be saved twice. The GET endpoint populates the full documents so the frontend can display them directly."

---

#### 5. Eligibility Routes & Matching Logic (`eligibilityRoutes.ts`, `models/Eligibility.ts`)
This is the most complex part of the backend — you built the eligibility form storage and the scheme matching engine.

**Eligibility form (`POST /api/eligibility`):**
- Validates required fields (age, income, gender, occupation, category, state)
- Normalizes the data (trims strings, converts booleans, derives flags like `isFarmer` from occupation)
- Uses `findOneAndUpdate` with `upsert: true` — creates a new profile if none exists, updates if it does

**Scheme matching (`GET /api/eligible-schemes`):**
- Loads the user's eligibility profile
- Fetches all schemes from DB
- Runs each scheme through `matchScheme()` which uses regex to parse the `eligibilityEn` text and checks:
  - Income limit (e.g. "income below 2 lakh")
  - Age range (e.g. "between 18 and 35", "above 60")
  - Caste category (SC, ST, OBC — only restricts if scheme explicitly requires it)
  - Gender (only restricts if scheme is explicitly for women)
  - Occupation (farmer, student, self-employed, worker)
  - Special conditions (BPL, widow, disabled, senior citizen)
- Returns only eligible schemes, sorted by number of matched reasons (best match first)

**Eligibility Model fields:** age, gender, maritalStatus, state, district, areaType, annualIncome, isBPL, occupation, educationLevel, category, isMinority, familySize, isSeniorCitizen, isWidow, isDifferentlyAbled, isFarmer, isStudent

**How to explain:** "I built the eligibility checker — the most complex feature in the backend. Users fill a profile form, and I match them against all schemes using a regex-based text parser. Each rule is checked independently so a scheme only gets rejected if it explicitly excludes the user. Results are ranked by how many criteria the user matches."

---

## 📊 Work Split Summary

| Area | Member 1 | Member 2 |
|------|----------|----------|
| Server setup & middleware | ✅ | |
| JWT & cookie auth | ✅ | |
| Register / Login / Logout | ✅ | |
| User management (admin) | ✅ | |
| Admin stats endpoint | ✅ | |
| User model | ✅ | |
| Document services CRUD | | ✅ |
| Welfare schemes CRUD | | ✅ |
| Government offices CRUD | | ✅ |
| Save / unsave bookmarks | | ✅ |
| Eligibility form & storage | | ✅ |
| Scheme matching engine | | ✅ |
| Service, Scheme, Office, Eligibility models | | ✅ |
