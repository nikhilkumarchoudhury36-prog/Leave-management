# Fixing Registration on Railway - Step by Step

## Current Issue
Registration is failing on Railway deployment. Let's debug and fix it.

## Step 1: Check Railway Logs

In Railway dashboard:
1. Click on your service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. Click "View Logs"

Look for error messages when you try to register.

## Common Issues and Solutions

### Issue 1: Database Not Connected

**Symptoms:**
- Error: "ECONNREFUSED" or "Cannot connect to database"
- Logs show connection errors

**Solution:**
1. In Railway, make sure MySQL service is added
2. Check environment variables are set:
   ```
   DATABASE_URL (automatically set by Railway)
   or
   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
   ```

3. Update `config/db.js` to use Railway's DATABASE_URL:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

let pool;

// Railway provides DATABASE_URL
if (process.env.DATABASE_URL) {
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Fallback to individual variables
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leave_management',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool.promise();
```

### Issue 2: Database Schema Not Imported

**Symptoms:**
- Error: "Table 'users' doesn't exist"
- Error: "Table 'leave_types' doesn't exist"

**Solution:**

1. **Connect to Railway MySQL:**
   ```bash
   # Get connection details from Railway dashboard
   mysql -h your-railway-host -u root -p your-database
   ```

2. **Import schema:**
   ```bash
   mysql -h your-railway-host -u root -p your-database < database/schema.sql
   ```

3. **Or use Railway CLI:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Link project
   railway link
   
   # Connect to database
   railway connect mysql
   
   # Then run:
   source database/schema.sql;
   ```

### Issue 3: Missing Environment Variables

**Symptoms:**
- Error: "JWT_SECRET is not defined"
- Registration works but login fails

**Solution:**

In Railway dashboard → Variables tab, add:
```
JWT_SECRET=your-super-secret-key-here-change-this-in-production
NODE_ENV=production
```

### Issue 4: CORS Errors

**Symptoms:**
- Registration request blocked by CORS
- Browser console shows CORS error

**Solution:**

Update `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Issue 5: Password Validation Failing

**Symptoms:**
- Error: "Password must contain uppercase, number, and special character"
- Password meets requirements but still fails

**Solution:**

Check `routes/authRoutes.js` validation rules match frontend:
```javascript
body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain a number')
  .matches(/[@$!%*?&#]/).withMessage('Password must contain a special character')
```

## Step 2: Enable Detailed Logging

I've already added detailed logging to the registration controller. After deploying, check Railway logs to see exactly where it fails.

The logs will show:
```
Registration attempt: { email: '...', department: '...' }
Hashing password...
Generating employee ID...
Generated employee ID: EMP007
Finding manager...
Assigned manager ID: 1
Inserting user...
User created with ID: 7
Creating leave balances...
Found leave types: 4
Leave balances created
Registration successful for: ...
```

If it fails, you'll see:
```
=== REGISTRATION ERROR ===
Error message: ...
Error code: ...
SQL message: ...
========================
```

## Step 3: Test Database Connection

Create a test endpoint to verify database works:

Add to `server.js`:
```javascript
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./config/db');
    const [result] = await db.query('SELECT 1 + 1 as result');
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    const [leaveTypes] = await db.query('SELECT COUNT(*) as count FROM leave_types');
    
    res.json({
      status: 'ok',
      database: 'connected',
      test: result[0].result,
      users: users[0].count,
      leaveTypes: leaveTypes[0].count
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code
    });
  }
});
```

Then visit: `https://your-app.railway.app/api/test-db`

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "test": 2,
  "users": 6,
  "leaveTypes": 4
}
```

## Step 4: Check Railway MySQL Service

1. In Railway dashboard, click on MySQL service
2. Go to "Variables" tab
3. You should see:
   - MYSQL_URL
   - MYSQL_HOST
   - MYSQL_PORT
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

4. Make sure your app service has access to these variables

## Step 5: Verify Schema is Imported

Connect to Railway MySQL and check:

```sql
-- Check if tables exist
SHOW TABLES;

-- Should show:
-- holidays
-- leave_balances
-- leave_requests
-- leave_types
-- users

-- Check if leave_types has data
SELECT * FROM leave_types;

-- Should show 4 types:
-- Vacation, Sick Leave, Personal Leave, Unpaid Leave

-- Check if there's a manager
SELECT * FROM users WHERE role IN ('manager', 'admin');

-- Should show at least one manager
```

## Step 6: Common Railway-Specific Issues

### Railway MySQL Connection String Format

Railway provides `MYSQL_URL` in this format:
```
mysql://user:password@host:port/database
```

Update `config/db.js` to handle this:

```javascript
const mysql = require('mysql2');
require('dotenv').config();

let pool;

if (process.env.MYSQL_URL) {
  // Railway format
  pool = mysql.createPool(process.env.MYSQL_URL);
} else if (process.env.DATABASE_URL) {
  // Alternative format
  pool = mysql.createPool(process.env.DATABASE_URL);
} else {
  // Individual variables
  pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'leave_management',
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool.promise();
```

## Step 7: Deploy Updated Code

```bash
# Commit changes
git add .
git commit -m "Fix registration with better error handling"
git push

# Railway will auto-deploy
```

## Step 8: Test Registration Again

1. Go to your Railway app URL
2. Click "Register"
3. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Department: Engineering
   - Password: Test@1234
   - Confirm Password: Test@1234
4. Click "Register"

## Step 9: Check Logs for Errors

If it still fails:
1. Open Railway logs
2. Look for the detailed error messages
3. Share the error message

Common error patterns:

**"Cannot read property 'count' of undefined"**
→ Database query failed, check connection

**"ER_NO_SUCH_TABLE: Table 'users' doesn't exist"**
→ Schema not imported, run schema.sql

**"ER_DUP_ENTRY: Duplicate entry"**
→ Email already exists, try different email

**"ValidationError"**
→ Password doesn't meet requirements

## Quick Checklist

- [ ] Railway MySQL service is running
- [ ] Database schema imported (tables exist)
- [ ] Environment variables set (JWT_SECRET)
- [ ] Can access /api/test-db endpoint
- [ ] Logs show detailed error messages
- [ ] At least one manager exists in database
- [ ] Leave types table has 4 entries

## Still Not Working?

Share the Railway logs output when you try to register. The detailed logging I added will show exactly where it's failing.

Look for lines starting with:
- "Registration attempt:"
- "=== REGISTRATION ERROR ==="

Copy those lines and I can help debug further!
