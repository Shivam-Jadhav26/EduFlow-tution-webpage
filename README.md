# EduFlow — Tuition Management Platform

A full-stack web application for managing tuition classes, students, courses, batches, tests, fees, and more.

## 🛠️ Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS (hosted on **Vercel**)
- **Backend**: Node.js + Express + MongoDB Atlas (hosted on **Render**)

## 🚀 Run Locally

**Prerequisites:** Node.js ≥ 18, MongoDB Atlas account

1. Clone the repo & install dependencies:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. Create a `.env` file in the root (see `.env.example`):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   VITE_API_URL=http://localhost:5000
   ```

3. Seed the database (optional):
   ```bash
   npm run seed
   ```

4. Start both servers:
   ```bash
   # Terminal 1 – Backend
   npm run start

   # Terminal 2 – Frontend
   npm run dev
   ```

5. Open: http://localhost:5173

## 🌍 Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Set `VITE_API_URL` = Render backend URL |
| Backend | Render | Set `CLIENT_URL` = Vercel frontend URL, `MONGODB_URI`, `JWT_SECRET` |
