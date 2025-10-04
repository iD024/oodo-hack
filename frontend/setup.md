# Quick Setup Guide

## 🚀 Getting Started

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- Remember your password for the 'postgres' user
- Create a database named `expense_management`

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run init-db
npm run dev
```

### 3. Frontend Setup
```bash
# In the root directory
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔑 Default Login Credentials

After running `npm run init-db` in the backend directory:

- **Admin**: admin@company.com / admin123
- **Manager**: manager@company.com / manager123
- **Employee**: employee@company.com / employee123

## 🛠️ Troubleshooting

### Database Connection Issues
1. Make sure PostgreSQL is running
2. Check your database credentials in `.env`
3. Ensure the database `expense_management` exists

### Port Already in Use
- Backend runs on port 5000
- Frontend runs on port 5173
- Change ports in `.env` and `vite.config.js` if needed

### CORS Issues
- Make sure the frontend URL in backend `.env` matches your frontend URL
- Default: `FRONTEND_URL=http://localhost:5173`
