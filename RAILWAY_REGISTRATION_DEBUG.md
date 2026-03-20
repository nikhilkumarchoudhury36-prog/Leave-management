# Railway Registration Issue - Works Locally, Fails on Deployment

## The Problem
✅ Registration works perfectly on localhost
❌ Registration fails after deploying to Railway

This means the issue is environment-specific, not code-related.

## Most Common Causes (in order of likelihood)

### 1. Database Schema Not Imported to Railway MySQL ⭐ MOST LIKELY

**Why it happens:**
- You have a local MySQL with the schema imported
- Railway MySQL is a separate database that's empty

**How to check:**
Visit your Railway app: `https://your-app.railway.app/api/health`

If you see:
```json
{
  "status": "error",
  "message": "Table 'users' doesn't exist"
}
```
→ Schema not imported!

**Solution:**

#### Option A: Using Railway CLI (Easiest)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to MySQL
railway connect mysql

# You'll be in MySQL prompt, run:
source database/schema.sql;

# Check if it worked:
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leave_types;

# Exit
exit;
```

#### Option B: Using MySQL Workbench
1. Get Railway MySQL credentials:
   - Railway Dashboard → MySQL service → Connect tab
   - Copy: Host, Port, Username, Password, Database
2. Open MySQL Workbench
3. Create new connection with Railway credentials
4. File → Run SQL Script → Select `database/schema.sql`
5. Execute

#### Option C: Using Command Line
```bash
# Get credentials from Railway dashboard
mysql -h containers-us-west-xxx.railway.app -P 6789 -u root -p your_database < database/schema.sql
```

---

### 2. Environment Variables Not Set

**How to check:**
Railway Dashboard → Your Service → Variables tab

**Required variables:**
```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

**Note:** Railway automatically sets MySQL variables:
- MYSQL_URL
- MYSQL_HOST
- MYSQL_USER
- MYSQL_PASSWORD
- MYSQL_DATABASE

**Solution:**
Add JWT_SECRET if missing:
1. Railway Dashboard → Variables
2. Click "New Variable"
3. Name: `JWT_SECRET`
4. Value: `your-super-secret-key-change-this`
5. Click "Add"

---

### 3. Database Connection Using Wrong Format

**How to check:**
Look at Railway logs for connection errors.

**Solution:**
The `config/db.js` I updated should handle this automatically. It tries:
1. MYSQL_URL (Railway's format)
2. DATABASE_URL (alternative)
3. Individual variables (fallback)

If still failing, verify Railway MySQL service is linked to your app.

---

### 4. CORS Issues

**How to check:**
Open browser console (F12) when trying to register.
Look for: "CORS policy" error

**Solution:**
Update `server.js`:
```javascript
app.use(cors({
  origin: '*', // Or your Railway URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

---

### 5. Railway Build/Start Command Wrong

**How to check:**
Railway Dashboard → Settings → Build & Deploy

**Should be:**
- Build Command: `npm install`
- Start Command: `npm start` or `node server.js`

**Solution:**
If different, update in Railway settings.

---

## Step-by-Step Debugging Process

### Step 1: Check Health Endpoint

Visit: `https://your-app.railway.app/api/health`

**Scenario A: Returns error about tables**
```json
{
  "status": "error",
  "message": "Table 'users' doesn't exist"
}
```
→ **Solution:** Import schema (see #1 above)

**Scenario B: Returns connection error**
```json
{
  "status": "error",
  "message": "connect ECONNREFUSED"
}
```
→ **Solution:** MySQL service not linked or not running

**Scenario C: Returns success but wrong counts**
```json
{
  "status": "ok",
  "stats": {
    "users": 0,
    "leaveTypes": 0,
    "managers": 0
  }
}
```
→ **Solution:** Schema imported but no data. Re-import schema.sql

**Scenario D: Returns success with correct counts**
```json
{
  "status": "ok",
  "stats": {
    "users": 5,
    "leaveTypes": 4,
    "managers": 1
  }
}
```
→ **Database is fine!** Issue is elsewhere (see steps below)

---

### Step 2: Check Railway Logs

1. Railway Dashboard → Your Service
2. Click "Deployments"
3. Click latest deployment
4. Click "View Logs"

**Look for these patterns:**

**Pattern 1: Database connection errors**
```
Error: connect ECONNREFUSED
Error: ER_ACCESS_DENIED_ERROR
```
→ Database not connected

**Pattern 2: Table doesn't exist**
```
Error: ER_NO_SUCH_TABLE: Table 'users' doesn't exist
```
→ Schema not imported

**Pattern 3: Registration attempt logs**
```
Registration attempt: { email: '...', department: '...' }
Hashing password...
=== REGISTRATION ERROR ===
Error message: ...
```
→ Shows exactly where it fails

---

### Step 3: Test Registration with Detailed Logs

1. Try to register on Railway app
2. Immediately check Railway logs
3. Look for the detailed error messages I added

**What you should see:**
```
Registration attempt: { email: 'test@test.com', department: 'Engineering' }
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
Registration successful for: test@test.com
```

**If it stops at any step, that's where the problem is.**

---

### Step 4: Verify MySQL Service is Linked

1. Railway Dashboard → Your App Service
2. Click "Settings" tab
3. Scroll to "Service Variables"
4. You should see MySQL variables like:
   - MYSQL_URL
   - MYSQL_HOST
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

**If missing:**
1. Go to your project dashboard
2. Click "+ New" → "Database" → "Add MySQL"
3. Railway will auto-link it and add variables

---

### Step 5: Test Database Connection from Railway

Add this temporary endpoint to `server.js`:

```javascript
app.get('/api/debug-db', async (req, res) => {
  try {
    const db = require('./config/db');
    
    // Test connection
    const [test] = await db.query('SELECT 1 + 1 as result');
    
    // Check tables
    const [tables] = await db.query('SHOW TABLES');
    
    // Check users
    const [users] = await db.query('SELECT id, employee_id, first_name, role FROM users LIMIT 5');
    
    // Check leave types
    const [leaveTypes] = await db.query('SELECT * FROM leave_types');
    
    res.json({
      status: 'ok',
      connection: 'working',
      test: test[0].result,
      tables: tables.map(t => Object.values(t)[0]),
      users: users,
      leaveTypes: leaveTypes
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
  }
});
```

Then visit: `https://your-app.railway.app/api/debug-db`

This will show you exactly what's in the database.

---

## Quick Fix Checklist

Run through this checklist:

- [ ] Railway MySQL service is added and running
- [ ] MySQL service is linked to app (variables visible)
- [ ] Database schema imported (run schema.sql)
- [ ] JWT_SECRET environment variable set
- [ ] `/api/health` returns success with correct counts
- [ ] Railway logs show no connection errors
- [ ] Build and start commands are correct
- [ ] Latest code is pushed to GitHub
- [ ] Railway auto-deployed latest code

---

## Most Likely Solution (90% of cases)

**The schema is not imported to Railway MySQL.**

Run this:
```bash
railway login
railway link
railway connect mysql
source database/schema.sql;
exit;
```

Then try registration again.

---

## If Still Not Working

1. **Share Railway logs** - Copy the logs when you try to register
2. **Share /api/health response** - What does it return?
3. **Share /api/debug-db response** - What tables/data exist?

With these three pieces of information, I can pinpoint the exact issue!

---

## Common Mistakes

❌ **Mistake 1:** Assuming Railway uses your local database
→ Railway has its own MySQL instance

❌ **Mistake 2:** Not importing schema after creating MySQL service
→ Railway MySQL starts empty

❌ **Mistake 3:** Importing schema to local MySQL instead of Railway
→ Check you're connected to Railway MySQL, not localhost

❌ **Mistake 4:** Not waiting for deployment to complete
→ Wait for "Success" status before testing

❌ **Mistake 5:** Testing old deployment
→ Make sure latest code is deployed

---

## Success Indicators

✅ `/api/health` returns:
```json
{
  "status": "ok",
  "stats": {
    "users": 5,
    "leaveTypes": 4,
    "managers": 1
  }
}
```

✅ Railway logs show:
```
Using MYSQL_URL for database connection
Server running on http://...
```

✅ Registration works without errors

✅ Can login with registered account

---

## Next Steps

1. **First:** Check `/api/health` on Railway
2. **If error:** Import schema to Railway MySQL
3. **If success:** Check Railway logs during registration
4. **Share logs:** If still failing, share the error logs

The detailed logging I added will show exactly where it fails!
