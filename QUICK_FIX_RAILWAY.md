# Quick Fix: Registration Works Locally, Fails on Railway

## TL;DR - Most Likely Cause

**Your Railway MySQL database doesn't have the schema imported.**

Local works because your local MySQL has the tables.
Railway fails because Railway MySQL is empty.

## Quick Fix (5 minutes)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Import Schema
```bash
# Login to Railway
railway login

# Link to your project (select from list)
railway link

# Connect to Railway MySQL
railway connect mysql

# Import schema (you'll be in MySQL prompt)
source database/schema.sql;

# Verify it worked
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leave_types;

# Exit
exit;
```

### Step 3: Test
Go to: `https://your-app.railway.app/api/health`

Should return:
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

### Step 4: Try Registration Again
Should work now!

---

## Alternative: Without Railway CLI

### Using MySQL Workbench:

1. **Get Railway MySQL credentials:**
   - Railway Dashboard → MySQL service → Connect tab
   - Copy: Host, Port, Username, Password, Database name

2. **Connect in MySQL Workbench:**
   - Create new connection
   - Enter Railway credentials
   - Test connection

3. **Import schema:**
   - File → Run SQL Script
   - Select: `D:\management\database\schema.sql`
   - Click Execute

4. **Verify:**
   - Refresh schemas
   - Check tables exist
   - Check data exists

---

## How to Verify It's Fixed

✅ `/api/health` returns success
✅ Registration works
✅ Can login with new account
✅ Railway logs show no errors

---

## Still Not Working?

Check Railway logs:
1. Railway Dashboard → Your Service
2. Deployments → Latest → View Logs
3. Try to register
4. Look for error messages

Share the error message and I can help!

---

## Why This Happens

- **Local:** Uses your local MySQL (has schema)
- **Railway:** Uses Railway MySQL (starts empty)
- **Solution:** Import schema to Railway MySQL

It's like having two separate databases - you need to set up both!
