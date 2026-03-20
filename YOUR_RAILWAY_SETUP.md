# Your Railway Setup - Specific Instructions

## Current Status
✅ MySQL service: Online
✅ Leave-management service: Online
❌ Registration/Login: Failing

## Most Likely Issue

The MySQL database exists but is **empty** (no tables/data).

## Solution: Import Schema to Railway MySQL

### Method 1: Using Railway's MySQL Connection String

1. **Get MySQL Connection Details:**
   - In Railway dashboard, click on **"MySQL"** service
   - Click **"Connect"** tab
   - Copy the **"MySQL Connection URL"** (looks like: `mysql://root:password@host:port/railway`)

2. **Import Schema Using Command Line:**
   ```bash
   # Replace with your actual MySQL URL from Railway
   mysql -h containers-us-west-xxx.railway.app -P 6789 -u root -p railway < database/schema.sql
   ```
   
   When prompted, enter the password from Railway.

### Method 2: Using MySQL Workbench (Recommended)

1. **Get Connection Details from Railway:**
   - Click "MySQL" service
   - Click "Connect" tab
   - Note down:
     - Host: `containers-us-west-xxx.railway.app`
     - Port: `6789` (or whatever is shown)
     - Username: `root`
     - Password: (copy this)
     - Database: `railway`

2. **Connect in MySQL Workbench:**
   - Open MySQL Workbench
   - Click "+" next to MySQL Connections
   - Fill in:
     - Connection Name: `Railway MySQL`
     - Hostname: (paste from Railway)
     - Port: (paste from Railway)
     - Username: `root`
     - Password: Click "Store in Vault", paste password
   - Click "Test Connection"
   - Should say "Successfully connected"
   - Click "OK"

3. **Import Schema:**
   - Double-click the "Railway MySQL" connection
   - File → Open SQL Script
   - Navigate to: `D:\management\database\schema.sql`
   - Click "Open"
   - Click the lightning bolt ⚡ icon (or press Ctrl+Shift+Enter)
   - Wait for execution to complete
   - You should see "OK" messages for each statement

4. **Verify Import:**
   - In left sidebar, click refresh icon (🔄)
   - Expand "railway" database
   - Expand "Tables"
   - You should see:
     - holidays
     - leave_balances
     - leave_requests
     - leave_types
     - users

### Method 3: Using Railway Variables to Connect

1. **Get MySQL URL from Railway:**
   - Click "Leave-management" service
   - Go to "Variables" tab
   - Look for `MYSQL_URL` or `DATABASE_URL`
   - Copy the value

2. **Use it to connect:**
   ```bash
   # If MYSQL_URL is: mysql://root:pass@host:port/railway
   mysql -h host -P port -u root -p railway < database/schema.sql
   ```

## After Importing Schema

### Step 1: Verify Database Has Data

Visit: `https://your-app.railway.app/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-20T...",
  "database": "connected",
  "test": 2,
  "stats": {
    "users": 5,
    "leaveTypes": 4,
    "managers": 1
  }
}
```

**If you see error:**
```json
{
  "status": "error",
  "message": "Table 'railway.users' doesn't exist"
}
```
→ Schema not imported yet, try again

### Step 2: Check Railway Logs

1. Click "Leave-management" service
2. Go to "Deployments"
3. Click latest deployment
4. Click "View Logs"
5. Look for:
   ```
   Using MYSQL_URL for database connection
   Server running on http://...
   ```

### Step 3: Test Registration

1. Go to your Railway app URL
2. Click "Register"
3. Fill in form
4. Submit

**If it fails:**
- Immediately check Railway logs
- Look for detailed error messages
- Share the error here

### Step 4: Test Login

Try logging in with default credentials:
- Email: `manager@company.com`
- Password: `Admin@123`

## Common Issues After Adding MySQL

### Issue 1: App Can't Connect to MySQL

**Symptoms:**
- `/api/health` shows connection error
- Logs show "ECONNREFUSED"

**Solution:**
1. Check MySQL service is "Online" (green dot)
2. Verify `MYSQL_URL` variable exists in Leave-management service
3. Redeploy Leave-management service

### Issue 2: Tables Don't Exist

**Symptoms:**
- `/api/health` shows "Table doesn't exist"
- Registration fails with database error

**Solution:**
- Import schema using one of the methods above

### Issue 3: No Managers in Database

**Symptoms:**
- `/api/health` shows `"managers": 0`
- Registration succeeds but user has no manager

**Solution:**
- Schema imported but data missing
- Re-import schema.sql (it includes seed data)

## Debugging Checklist

- [ ] MySQL service is "Online" in Railway
- [ ] Leave-management service is "Online" in Railway
- [ ] MYSQL_URL variable exists in Leave-management variables
- [ ] Schema imported to Railway MySQL (tables exist)
- [ ] `/api/health` returns success with correct counts
- [ ] Railway logs show no connection errors
- [ ] Can see detailed error logs when trying to register

## Quick Test Commands

```bash
# Check if Railway CLI can see your services
railway status

# View live logs
railway logs

# Check environment variables
railway variables
```

## What to Share If Still Not Working

1. **Response from `/api/health`** - Copy the JSON
2. **Railway logs** - Copy the error messages when you try to register
3. **MySQL connection test** - Can you connect with MySQL Workbench?

With these three pieces of info, I can pinpoint the exact issue!

## Expected Working State

✅ MySQL: Online
✅ Leave-management: Online  
✅ `/api/health`: Returns success
✅ Railway logs: No errors
✅ Registration: Works
✅ Login: Works

Once schema is imported, everything should work!
