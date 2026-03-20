# Simple Way to Import Database to Railway

## Method 1: Using Railway's Query Tab (Easiest!)

### Step 1: Open Railway MySQL Query Interface

1. Go to https://railway.app
2. Click on your **"MySQL"** service
3. Click on the **"Query"** tab (should be next to Connect, Variables, etc.)
4. You'll see a SQL query interface

### Step 2: Copy the Schema SQL

1. On your computer, open: `D:\management\database\schema-railway.sql`
2. Open it with Notepad or any text editor
3. Press **Ctrl+A** to select all
4. Press **Ctrl+C** to copy

### Step 3: Paste and Execute

1. Go back to Railway Query tab
2. Click in the query box
3. Press **Ctrl+V** to paste the entire schema
4. Click **"Run"** or **"Execute"** button
5. Wait 5-10 seconds
6. You should see success messages

### Step 4: Verify

1. In the Query tab, run this simple query:
```sql
SELECT COUNT(*) as user_count FROM users;
```
2. Click Run
3. Should show: `user_count: 5`

**If you see 5 users: ✅ SUCCESS!**

---

## Method 2: Using Railway CLI (If you have it installed)

### Step 1: Install Railway CLI (if not installed)

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open a browser window to authenticate.

### Step 3: Link to Your Project

```bash
cd D:\management
railway link
```

Select your project from the list.

### Step 4: Connect to MySQL

```bash
railway connect mysql
```

This opens a MySQL prompt connected to your Railway database.

### Step 5: Import Schema

In the MySQL prompt:
```sql
source database/schema-railway.sql
```

Wait for it to complete, then:
```sql
SELECT COUNT(*) FROM users;
```

Should show: 5

Type `exit` to close.

---

## Method 3: Manual Copy-Paste (If Railway Query has character limits)

If Railway Query tab has a character limit, we'll do it in chunks:

### Chunk 1: Create Tables

Copy and paste this into Railway Query tab:

```sql
USE railway;

DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employee','manager','admin') DEFAULT 'employee',
    manager_id INT NULL,
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_days INT NOT NULL,
    carry_over BOOLEAN DEFAULT FALSE
);

CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year YEAR NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    used_days DECIMAL(4,1) DEFAULT 0,
    remaining_days DECIMAL(4,1) AS (total_days - used_days) STORED,
    UNIQUE(user_id, leave_type_id, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    reason TEXT,
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    reviewed_by INT NULL,
    review_comment TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    date DATE UNIQUE NOT NULL
);
```

Click **Run**. Wait for success.

### Chunk 2: Insert Leave Types

```sql
INSERT INTO leave_types (name, default_days, carry_over) VALUES
('Annual Leave', 15, TRUE),
('Sick Leave', 10, FALSE),
('Casual Leave', 5, FALSE),
('Maternity/Paternity Leave', 90, FALSE);
```

Click **Run**.

### Chunk 3: Insert Users

```sql
INSERT INTO users (employee_id, first_name, last_name, email, password_hash, role, manager_id, department) VALUES
('EMP001', 'Admin', 'User', 'admin@company.com', '$2a$10$n3XK4OYHG7ZcwTuJEHZ1/OS9vE0TVf6xd7AVQWZ7OJQvOGdvkegkW', 'admin', NULL, 'Management'),
('EMP002', 'John', 'Manager', 'manager@company.com', '$2a$10$kumsEw/NZSwlS51HKGKagej0NPXa9RCWo8.tlV6zA730mblNcy9eK', 'manager', NULL, 'Management'),
('EMP003', 'John', 'Doe', 'john.doe@company.com', '$2a$10$OrCbtxUzEu9d63yiLEifneFt2samxnlOP65RZHJYKlgoJWNfbfyYu', 'employee', 1, 'Engineering'),
('EMP004', 'Jane', 'Smith', 'jane.smith@company.com', '$2a$10$/Kw7lyUb8bajaDU.5VlhEOPXoFu1OKji3Qr2E4boLJAmEoBlrI/ym', 'employee', 1, 'Marketing'),
('EMP005', 'Bob', 'Wilson', 'bob.wilson@company.com', '$2a$10$6j6CTEotT2uXfAPfRMvLhe2d6t2BoTahAxVhoqoem.bQwwXO2YC7i', 'employee', 1, 'Sales');
```

Click **Run**.

### Chunk 4: Insert Leave Balances

```sql
INSERT INTO leave_balances (user_id, leave_type_id, year, total_days, used_days) VALUES
(1, 1, 2026, 15, 0), (1, 2, 2026, 10, 0), (1, 3, 2026, 5, 0), (1, 4, 2026, 90, 0),
(2, 1, 2026, 15, 0), (2, 2, 2026, 10, 0), (2, 3, 2026, 5, 0), (2, 4, 2026, 90, 0),
(3, 1, 2026, 15, 0), (3, 2, 2026, 10, 0), (3, 3, 2026, 5, 0), (3, 4, 2026, 90, 0),
(4, 1, 2026, 15, 0), (4, 2, 2026, 10, 0), (4, 3, 2026, 5, 0), (4, 4, 2026, 90, 0),
(5, 1, 2026, 15, 0), (5, 2, 2026, 10, 0), (5, 3, 2026, 5, 0), (5, 4, 2026, 90, 0);
```

Click **Run**.

### Chunk 5: Insert Holidays

```sql
INSERT INTO holidays (name, date) VALUES
('New Year\'s Day', '2026-01-01'),
('Republic Day', '2026-01-26'),
('Independence Day', '2026-08-15'),
('Gandhi Jayanti', '2026-10-02'),
('Diwali', '2026-11-01'),
('Christmas', '2026-12-25');
```

Click **Run**.

### Verify Everything

```sql
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL
SELECT 'Leave Balances', COUNT(*) FROM leave_balances
UNION ALL
SELECT 'Holidays', COUNT(*) FROM holidays;
```

Should show:
- Users: 5
- Leave Types: 4
- Leave Balances: 20
- Holidays: 6

---

## After Import: Test Your App

### Test 1: Health Endpoint

Visit: `https://your-app-name.railway.app/api/health`

Should see:
```json
{
  "status": "ok",
  "stats": {
    "users": 5,
    "leaveTypes": 4
  }
}
```

### Test 2: Login

1. Go to your Railway app URL
2. Try logging in:
   - Email: `manager@company.com`
   - Password: `Admin@123`
3. Should redirect to manager dashboard

### Test 3: Registration

1. Click "Register"
2. Create a new account
3. Should work now!

---

## Which Method Should You Use?

**Easiest:** Method 1 (Railway Query Tab) - No tools needed
**Fastest:** Method 2 (Railway CLI) - If you're comfortable with command line
**Most Reliable:** Method 3 (Manual chunks) - If Query tab has limits

---

## Still Having Issues?

Tell me:
1. Which method are you trying?
2. What error message do you see?
3. At which step are you stuck?

I'll help you through it!
