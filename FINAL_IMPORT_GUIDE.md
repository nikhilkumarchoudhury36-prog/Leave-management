# Final Import Guide - Use MySQL Workbench

Since Railway CLI requires MySQL client to be installed, let's use MySQL Workbench which you already have.

## Your Railway MySQL Connection Details

From your Railway dashboard, I can see:
- **Host:** `autorack.proxy.rlwy.net`
- **Port:** `22260`
- **Username:** `root`
- **Password:** (shown as ******** in Railway - you need to copy the actual password)
- **Database:** `railway`

---

## Step 1: Get Your MySQL Password from Railway

1. Go to Railway dashboard: https://railway.app
2. Click **MySQL** service
3. Click **"Connect"** tab
4. Find the **"Connection URL"** section
5. Click the **"show"** button next to the password (********)
6. **Copy the password** - you'll need it in Step 3

---

## Step 2: Open MySQL Workbench

1. Open **MySQL Workbench** on your computer
2. Click the **"+"** icon next to "MySQL Connections"

---

## Step 3: Create Railway Connection

Fill in these details:

```
Connection Name: Railway MySQL
Hostname: autorack.proxy.rlwy.net
Port: 22260
Username: root
```

1. Click **"Store in Vault..."** button next to Password
2. **Paste the password** you copied from Railway
3. Click **"OK"**
4. Click **"Test Connection"**
   - Should say: "Successfully connected to MySQL server"
   - If it fails, double-check the password
5. Click **"OK"** to save

---

## Step 4: Connect and Import

1. **Double-click** on "Railway MySQL" connection
2. It will connect to Railway
3. Click **File** → **Open SQL Script**
4. Navigate to: `D:\management\database\schema-railway.sql`
5. Click **"Open"**
6. Click the **lightning bolt ⚡ icon** (or press Ctrl+Shift+Enter)
7. Wait 5-10 seconds
8. You should see output like:

```
OK, 0 rows affected
OK, 5 rows affected    ← Users created!
OK, 4 rows affected    ← Leave types created!
OK, 20 rows affected   ← Leave balances created!
OK, 6 rows affected    ← Holidays created!
```

---

## Step 5: Verify Import

In MySQL Workbench, run this query:

```sql
SELECT 'Users' as Table_Name, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL
SELECT 'Leave Balances', COUNT(*) FROM leave_balances
UNION ALL
SELECT 'Holidays', COUNT(*) FROM holidays;
```

**Expected output:**
- Users: 5
- Leave Types: 4
- Leave Balances: 20
- Holidays: 6

**If you see these numbers: ✅ SUCCESS!**

---

## Step 6: Test Your Railway App

### Test Health Endpoint

1. Go to Railway dashboard
2. Click "Leave-management" service
3. Go to "Settings" tab
4. Find your app URL (under "Domains")
5. Visit: `https://your-app-url.railway.app/api/health`

**Expected response:**
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

### Test Login

1. Go to: `https://your-app-url.railway.app`
2. Login with:
   - Email: `manager@company.com`
   - Password: `Admin@123`
3. Should redirect to manager dashboard

### Test Registration

1. Click "Register"
2. Create a new account
3. Should work now!

---

## Troubleshooting

### Can't connect to Railway MySQL

**Error:** "Access denied" or "Connection refused"

**Solutions:**
1. Make sure you copied the correct password from Railway (click "show" button)
2. Verify MySQL service is "Online" (green dot) in Railway
3. Check hostname and port are exactly: `autorack.proxy.rlwy.net` and `22260`

### Import fails with "Table already exists"

**Solution:** Run this first in MySQL Workbench:

```sql
USE railway;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
```

Then run the schema-railway.sql again.

### Health endpoint still shows 0 users

**Possible causes:**
1. Schema imported to wrong database
2. Wrong Railway MySQL instance

**Solution:** In MySQL Workbench, verify:

```sql
USE railway;
SHOW TABLES;
```

Should show 5 tables. If not, import didn't work.

---

## Alternative: Manual Copy-Paste

If MySQL Workbench import doesn't work, you can copy-paste the SQL directly:

1. Open: `D:\management\COPY_PASTE_THIS.sql`
2. Select all (Ctrl+A) and copy (Ctrl+C)
3. In MySQL Workbench, paste into query window
4. Click Execute

---

## Summary

1. ✅ Get password from Railway (click "show" button)
2. ✅ Create MySQL Workbench connection to Railway
3. ✅ Import schema-railway.sql
4. ✅ Verify 5 users exist
5. ✅ Test health endpoint
6. ✅ Test login and registration

**Total time: ~5 minutes**

You're almost there! Just need to import the schema using MySQL Workbench.
