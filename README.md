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

## 📞 Contact

For .env files or any setup issues, contact the project owner directly.
