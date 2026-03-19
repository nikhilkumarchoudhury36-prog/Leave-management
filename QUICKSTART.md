# Quick Start Guide

## Installation (5 minutes)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your MySQL password and JWT secret.

3. **Set up database:**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Generate password hashes:**
   ```bash
   npm run setup
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Open browser:**
   Navigate to `http://localhost:3000`

## Test Login

**Manager Account:**
- Email: `manager@company.com`
- Password: `Admin@123`

**Employee Account:**
- Email: `emp1@company.com`
- Password: `Emp@1234`

## What to Try

1. Login as employee → Request a leave
2. Login as manager → Approve/reject the request
3. Check the calendar to see approved leaves
4. View leave balances

That's it! You're ready to go.
