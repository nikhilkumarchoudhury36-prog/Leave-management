# Quick Railway Fix - 3 Steps

## Problem
Registration works locally but fails on Railway.

## Solution (10 minutes)

### Step 1: Add JWT_SECRET to Railway (2 min)

1. Go to https://railway.app
2. Click "Leave-management" service
3. Click "Variables" tab
4. Click "New Variable"
5. Add:
   - Name: `JWT_SECRET`
   - Value: `my_super_secret_jwt_key_change_this_in_production_12345`
6. Click "Add"
7. Wait for auto-redeploy (watch Deployments tab)

### Step 2: Import Database Schema (5 min)

1. In Railway, click "MySQL" service
2. Click "Connect" tab
3. Copy connection details:
   - Host: `containers-us-west-xxx.railway.app`
   - Port: `6789`
   - Username: `root`
   - Password: `xxxxx`
   - Database: `railway`

4. Open MySQL Workbench
5. Create new connection with Railway details
6. Connect to Railway MySQL
7. File → Open SQL Script → Select `D:\management\database\schema.sql`
8. Click Execute (⚡ icon)
9. Wait for "OK" messages

### Step 3: Test (3 min)

1. Visit: `https://your-app.railway.app/api/health`
2. Should see:
   ```json
   {
     "status": "ok",
     "stats": {
       "users": 5,
       "leaveTypes": 4
     }
   }
   ```

3. If yes, go to your Railway app and test registration!

## That's It!

If Step 3 shows the correct stats, registration will work.

## Still Not Working?

Check these:

1. **Railway Logs** - Any errors?
   - Click service → Deployments → Latest → View Logs

2. **Health Endpoint** - What does it show?
   - Share the JSON response

3. **MySQL Connection** - Can you connect?
   - Test connection in MySQL Workbench

Share these three things and I'll help debug!

## Expected Result

✅ Health endpoint returns stats
✅ Registration creates new user
✅ Login works
✅ Manager dashboard shows requests

**Total time: ~10 minutes**
