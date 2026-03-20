# Final Railway Deployment Checklist

## Current Issue
❌ `/api/health` returns "Cannot GET /api/health" on Railway
✅ Everything works perfectly on localhost

## Root Cause
The health endpoint exists in your local `server.js` but Railway is either:
1. Running old code without the health endpoint
2. Not starting the server properly
3. Having build/deployment errors

---

## STEP-BY-STEP FIX

### Step 1: Push Latest Code to GitHub

Your local code has the health endpoint, but Railway needs to get it from GitHub.

```bash
# Check what files have changed
git status

# Add all changes
git add .

# Commit with a clear message
git commit -m "Add health endpoint and fix database connection"

# Push to GitHub (Railway will auto-deploy)
git push origin main
```

**Expected output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/yourusername/yourrepo.git
   abc1234..def5678  main -> main
```

### Step 2: Wait for Railway Auto-Deploy

1. Go to Railway dashboard: https://railway.app
2. Click on your "Leave-management" service
3. Go to "Deployments" tab
4. You should see a new deployment starting (triggered by your GitHub push)
5. Wait for status to change from "Building" → "Deploying" → "Success"

**This usually takes 1-3 minutes.**

### Step 3: Check Deployment Logs

While deployment is running:

1. Click on the latest deployment
2. Click "View Logs"
3. Look for these success messages:
   ```
   Using MYSQL_URL for database connection
   Server running on http://...
   ```

**If you see errors:**
- Copy the error message
- Share it so I can help fix it

### Step 4: Test Health Endpoint

Once deployment shows "Success":

1. Go to: `https://your-app-name.railway.app/api/health`
2. You should see JSON response like:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-03-20T...",
     "database": "connected",
     "test": 2,
     "stats": {
       "users": 0,
       "leaveTypes": 0,
       "managers": 0
     }
   }
   ```

**If stats show all zeros (0):**
- Database is connected ✅
- But tables are empty ❌
- Continue to Step 5

**If you see error:**
```json
{
  "status": "error",
  "message": "Table 'railway.users' doesn't exist"
}
```
- Database connected ✅
- Schema not imported ❌
- Continue to Step 5

### Step 5: Import Database Schema to Railway

Your Railway MySQL is empty. You need to import the schema.

#### Option A: Using MySQL Workbench (Easiest)

1. **Get Railway MySQL Connection Details:**
   - In Railway, click "MySQL" service
   - Click "Connect" tab
   - Copy these values:
     - Host: `containers-us-west-xxx.railway.app`
     - Port: `6789` (example)
     - Username: `root`
     - Password: `xxxxx`
     - Database: `railway`

2. **Connect in MySQL Workbench:**
   - Open MySQL Workbench
   - Click "+" next to MySQL Connections
   - Enter:
     - Connection Name: `Railway MySQL`
     - Hostname: (paste from Railway)
     - Port: (paste from Railway)
     - Username: `root`
     - Password: Click "Store in Vault", paste password
   - Click "Test Connection" → Should succeed
   - Click "OK"

3. **Import Schema:**
   - Double-click "Railway MySQL" connection
   - File → Open SQL Script
   - Select: `D:\management\database\schema.sql`
   - Click lightning bolt ⚡ icon (Execute)
   - Wait for completion (should take 5-10 seconds)

4. **Verify:**
   - Refresh database in left sidebar
   - Expand "railway" → "Tables"
   - Should see: users, leave_types, leave_requests, leave_balances, holidays

#### Option B: Using Command Line

```bash
# Get connection details from Railway first
# Then run (replace with your actual values):
mysql -h containers-us-west-xxx.railway.app -P 6789 -u root -p railway < database/schema.sql

# Enter password when prompted
```

### Step 6: Verify Schema Import

Go to: `https://your-app-name.railway.app/api/health`

**Expected response NOW:**
```json
{
  "status": "ok",
  "database": "connected",
  "stats": {
    "users": 5,
    "leaveTypes": 4,
    "managers": 1
  }
}
```

✅ If you see these numbers, schema is imported successfully!

### Step 7: Test Registration

1. Go to your Railway app URL
2. Click "Register"
3. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test@123
   - Department: IT
4. Click "Register"

**Expected:** "Registration successful" message

### Step 8: Test Login

Try default manager account:
- Email: `manager@company.com`
- Password: `Admin@123`

**Expected:** Redirects to manager dashboard

---

## Troubleshooting

### Problem: Git push fails

**Error:** `fatal: not a git repository`

**Solution:**
```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repo
git remote add origin https://github.com/yourusername/yourrepo.git
git push -u origin main
```

### Problem: Railway not auto-deploying

**Solution:**
1. Check Railway dashboard → Settings → "GitHub Repo"
2. Make sure it's connected to your repository
3. Check "Deployments" tab for any failed builds
4. Manually trigger deploy: Click "Deploy" button

### Problem: Health endpoint still returns 404

**Possible causes:**
1. Old code still deployed
2. Server not starting
3. Wrong URL

**Solution:**
```bash
# Check Railway logs
railway logs

# Look for:
# - "Server running on..." (good)
# - Any error messages (share these)
```

### Problem: Can't connect to Railway MySQL

**Error:** `Access denied` or `Connection refused`

**Solution:**
1. Verify MySQL service is "Online" (green dot)
2. Double-check password (copy-paste from Railway)
3. Check if your IP needs to be whitelisted (Railway usually doesn't require this)

### Problem: Schema import fails

**Error:** `Table already exists`

**Solution:**
```sql
-- Drop existing tables first
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;

-- Then run schema.sql again
```

---

## Quick Reference: Railway URLs

- **Dashboard:** https://railway.app
- **Your App:** https://your-app-name.railway.app
- **Health Check:** https://your-app-name.railway.app/api/health
- **Login Page:** https://your-app-name.railway.app/index.html

---

## What to Share If Still Not Working

1. **Git push output** - Did it succeed?
2. **Railway deployment status** - Success or failed?
3. **Railway logs** - Any error messages?
4. **Health endpoint response** - What JSON do you see?
5. **Registration error** - Exact error message from browser console

With these details, I can pinpoint the exact issue!

---

## Expected Final State

✅ Code pushed to GitHub
✅ Railway auto-deployed successfully
✅ `/api/health` returns success with stats
✅ MySQL has 5 users, 4 leave types, 1 manager
✅ Registration works
✅ Login works
✅ Manager dashboard shows leave requests

**You're almost there! Just need to push code and import schema.**
