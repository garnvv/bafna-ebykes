# bafana E-Bikes Full-Stack Platform

A complete electric bike showroom management system with public website, customer portal, and admin dashboard.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Framer Motion, Chart.js
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL
- **Auth**: JWT, bcryptjs

## Prerequisites
- Node.js installed
- MySQL Server running

## Setup Instructions

### 1. Database Setup
Create a MySQL database named `bafana_ebikes`.

### 2. Backend Config
1. Go to `backend` directory.
2. Open `.env` and fill in your database credentials and email settings for reminders.
3. Run `npm install`.
4. Run `node scripts/seed.js` to initialize the database with sample bikes and an admin user.

### 3. Frontend Config
1. Go to `frontend` directory.
2. Run `npm install`.

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
*Port: 5001*

### Start Frontend
```bash
cd frontend
npm run dev
```
*Port: 5173* (Vite default)

## Login Credentials (Sample Data)
- **Admin**: `admin@bafana.com` / `adminpassword`
- **User**: `john@example.com` / `password123`

## Troubleshooting
If you encounter "Access denied" errors, verify your `DB_PASSWORD` in `backend/.env`.
If port 5001 is busy, you can change it in both `.env` and `frontend/src/services/api.js`.

## Features Included
- ✅ Public Website (Home, Bikes, About, Contact)
- ✅ Customer Dashboard (Bookings, Services, History, Loyalty)
- ✅ Admin Panel (Analytics Charts, Bike/Booking Management)
- ✅ Automated Email Reminders (Cron Job)
- ✅ Responsive Design with Premium EV Aesthetic
