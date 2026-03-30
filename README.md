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

## Hosting on Render

This project is pre-configured for one-click deployment on [Render](https://render.com/).

### 1. Push to GitHub
Ensure your latest code is pushed to a private or public repository on GitHub.

### 2. Database Connection
As Render does not offer a free MySQL plan, you'll need a MySQL instance. You can use:
- A paid Render MySQL instance.
- A free external provider like [Aiven](https://aiven.io/mysql) or [Railway](https://railway.app/).
Once you have your credentials, you will need to add them to Render.

### 3. Deploy with Blueprints
1. Log in to your Render Dashboard.
2. Click **New +** and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file.
5. Fill in the required **Environment Variables** (DB credentials, Email settings, etc.) when prompted.
6. Click **Apply**.

### 4. Important Environment Variables
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Your MySQL connection details.
- `DB_SSL`: Set to `true` (standard for cloud databases like Aiven).
- `EMAIL_USER`, `EMAIL_PASS`: Your Gmail address and Google App Password (for notifications).

## Features Included
- ✅ Public Website (Home, Bikes, About, Contact)
- ✅ Customer Dashboard (Bookings, Services, History, Loyalty)
- ✅ Admin Panel (Analytics Charts, Bike/Booking Management)
- ✅ Automated Email Reminders (Cron Job)
- ✅ Responsive Design with Premium EV Aesthetic
- ✅ Production-Ready Deployment configuration (Blueprint)
