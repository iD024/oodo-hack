# Expense Management System

A comprehensive expense management application built with React frontend and Node.js/Express backend with PostgreSQL database.

## Features

- **User Authentication**: Sign up, sign in, and role-based access control
- **Role-based Dashboards**: Different interfaces for Employees, Managers, and Admins
- **Expense Management**: Submit, track, and approve expense claims
- **User Management**: Admin panel for managing users and roles
- **Approval Workflows**: Configurable approval rules and processes
- **Real-time Updates**: Live data synchronization

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd expense-management-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=expense_management
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_super_secret_jwt_key_here

# Initialize database
npm run init-db

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

## Database Setup

1. **Install PostgreSQL** on your system
2. **Create a database** named `expense_management`
3. **Update the .env file** with your database credentials
4. **Run the initialization script**: `npm run init-db`

The initialization script will:
- Create all necessary tables
- Set up indexes for performance
- Create a default admin user

## Default Credentials

After running the database initialization, you can use these default credentials:

- **Admin**: admin@company.com / admin123
- **Manager**: manager@company.com / manager123  
- **Employee**: employee@company.com / employee123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/managers` - Get managers list

### Expenses
- `GET /api/expenses` - Get user's expenses
- `GET /api/expenses/all` - Get all expenses (Manager/Admin)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses/:id/approve` - Approve expense
- `POST /api/expenses/:id/reject` - Reject expense
- `GET /api/expenses/stats/summary` - Get expense statistics

## Project Structure

```
expense-management-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── expenses.js
│   ├── scripts/
│   │   └── init-db.js
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

### Frontend Development
```bash
npm run dev
```
Frontend runs on http://localhost:5173

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Database Schema

### Users Table
- id (UUID, Primary Key)
- name (VARCHAR)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- role (VARCHAR: employee, manager, admin)
- manager_id (UUID, Foreign Key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)

### Expenses Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- amount (DECIMAL)
- currency (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- receipt_url (VARCHAR)
- status (VARCHAR: pending, approved, rejected)
- submitted_at (TIMESTAMP)
- approved_at (TIMESTAMP)
- rejected_at (TIMESTAMP)
- approved_by (UUID, Foreign Key)
- rejected_by (UUID, Foreign Key)
- approval_comment (TEXT)
- rejection_reason (TEXT)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License