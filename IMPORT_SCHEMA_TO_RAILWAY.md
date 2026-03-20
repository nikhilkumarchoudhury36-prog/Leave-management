# Import Schema to Railway MySQL - Step by Step

## Current Status
❌ Railway MySQL: No tables (empty database)
✅ Local MySQL: Has all tables and data

## Goal
Copy the database structure and data from your local schema.sql to Railway MySQL.

---

## METHOD 1: MySQL Workbench (Recommended - Visual)

### Step 1: Get Railway MySQL Connection Details

1. Go to Railway dashboard: https://railway.app
2. Click on **"MySQL"** service (not Leave-management)
3. Click **"Connect"** tab
4. You'll see connection details like:

```
MYSQL_HOST=containers-us-west-xxx.railway.app
MYSQL_PORT=6789
MYSQL_USER=root
MYSQL_PASSWORD=xxxxxxxxxx
MYSQL_DATABASE=railway
```

**Write these down or keep the tab open!**

### Step 2: Open MySQL Workbench

1. Open MySQL Workbench on your computer
2. You should see your local connection (the one you use for localhost)

### Step 3: Create New Connection to Railway

1. Click the **"+"** icon next to "MySQL Connections"
2. Fill in the form:

```
Connection Name: Railway MySQL
Hostname: [paste MYSQL_HOST from Railway]
Port: [paste MYSQL_PORT from Railway]
Username: root
```

3. Click **"Store in Vault..."** next to Password
4. Paste the **MYSQL_PASSWORD** from Railway
5. Click **"OK"**

### Step 4: Test Connection

1. Click **"Test Connection"** button
2. Should say: **"Successfully connected to MySQL server"**
3. If it fails:
   - Double-check hostname, port, and password
   - Make sure MySQL service is "Online" in Railway
   - Try again

4. Click **"OK"** to save the connection

### Step 5: Connect to Railway MySQL

1. **Double-click** on "Railway MySQL" connection
2. You should see the connection open
3. In the left sidebar, you'll see "railway" database
4. Expand it - you'll see "Tables" folder is empty

### Step 6: Import Schema File

1. Click **File** → **Open SQL Script**
2. Navigate to: `D:\management\database\schema.sql`
3. Click **"Open"**
4. You'll see the SQL script in the editor

### Step 7: Execute the Script

1. Click the **lightning bolt ⚡ icon** in the toolbar (or press Ctrl+Shift+Enter)
2. Wait for execution (takes 5-10 seconds)
3. You should see output like:

```
Action Output:
OK, 0 rows affected
OK, 0 rows affected
OK, 5 rows affected
OK, 4 rows affected
...
```

4. Look for any errors (red text) - there shouldn't be any

### Step 8: Verify Tables Were Created

1. In the left sidebar, click the **refresh icon** 🔄
2. Expand **"railway"** database
3. Expand **"Tables"** folder
4. You should now see:
   - ✅ holidays
   - ✅ leave_balances
   - ✅ leave_requests
   - ✅ leave_types
   - ✅ users

### Step 9: Verify Data Was Inserted

1. Right-click on **"users"** table
2. Select **"Select Rows - Limit 1000"**
3. You should see 5 users:
   - admin@company.com
   - manager@company.com
   - john.doe@company.com
   - jane.smith@company.com
   - bob.wilson@company.com

4. Check **"leave_types"** table
5. Should see 4 leave types:
   - Annual Leave
   - Sick Leave
   - Casual Leave
   - Maternity/Paternity Leave

**If you see this data: ✅ SUCCESS! Schema imported correctly!**

---

## METHOD 2: Command Line (Alternative)

If you prefer command line or MySQL Workbench doesn't work:

### Step 1: Get Railway MySQL Connection String

1. Railway dashboard → MySQL service → Connect tab
2. Copy the **"MySQL Connection URL"**
3. It looks like: `mysql://root:password@host:port/railway`

### Step 2: Parse the Connection String

From: `mysql://root:ABC123@containers-us-west-123.railway.app:6789/railway`

Extract:
- Host: `containers-us-west-123.railway.app`
- Port: `6789`
- Password: `ABC123`
- Database: `railway`

### Step 3: Import Using MySQL Command

Open PowerShell or Command Prompt and run:

```bash
mysql -h containers-us-west-123.railway.app -P 6789 -u root -p railway < database/schema.sql
```

**Replace with your actual values!**

When prompted, enter the password from Railway.

### Step 4: Verify Import

```bash
mysql -h containers-us-west-123.railway.app -P 6789 -u root -p railway -e "SHOW TABLES;"
```

Should show:
```
+-------------------+
| Tables_in_railway |
+-------------------+
| holidays          |
| leave_balances    |
| leave_requests    |
| leave_types       |
| users             |
+-------------------+
```

---

## METHOD 3: Railway CLI (If Installed)

If you have Railway CLI installed:

```bash
# Connect to Railway MySQL
railway connect mysql

# Once connected, run:
source database/schema.sql;

# Verify:
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

---

## After Import: Test Your Railway App

### Step 1: Test Health Endpoint

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

✅ If you see `"users": 5` - Schema imported successfully!

### Step 2: Test Registration

1. Go to: `https://your-app.railway.app`
2. Click "Register"
3. Fill in form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test@123
   - Department: IT
4. Click "Register"

**Expected:** "Registration successful" message

### Step 3: Test Login

Try default manager account:
- Email: `manager@company.com`
- Password: `Admin@123`

**Expected:** Redirected to manager dashboard

---

## Troubleshooting

### Problem: Can't connect to Railway MySQL

**Error:** `Access denied` or `Connection refused`

**Solutions:**
1. Verify MySQL service is "Online" (green dot) in Railway
2. Double-check password (copy-paste from Railway)
3. Check hostname and port are correct
4. Try refreshing Railway dashboard to get latest credentials

### Problem: Schema import fails with errors

**Error:** `Table already exists`

**Solution:** Drop existing tables first:

```sql
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
```

Then run schema.sql again.

### Problem: Tables created but no data

**Check:** Did the INSERT statements run?

**Solution:** 
1. Open schema.sql in MySQL Workbench
2. Scroll to the INSERT statements
3. Execute just those lines
4. Or re-run the entire schema.sql

### Problem: Health endpoint still shows 0 users

**Possible causes:**
1. Schema imported to wrong database
2. Railway app connecting to different database
3. MYSQL_URL variable pointing to wrong database

**Solution:**
1. Check Railway Variables tab - verify MYSQL_URL
2. In MySQL Workbench, verify you're connected to "railway" database
3. Check tables exist in "railway" database, not another one

---

## Quick Verification Checklist

After import, verify:

- [ ] Railway MySQL Workbench connection works
- [ ] Can see 5 tables in "railway" database
- [ ] users table has 5 rows
- [ ] leave_types table has 4 rows
- [ ] Health endpoint returns stats with users: 5
- [ ] Registration creates new user (users count becomes 6)
- [ ] Login works with manager@company.com

---

## Need Help?

If import fails, share:

1. **Error message** from MySQL Workbench or command line
2. **Railway MySQL connection details** (hostname, port - NOT password)
3. **Screenshot** of error if possible

I'll help you fix it immediately!

---

## Expected Timeline

- Get Railway connection details: 1 min
- Create MySQL Workbench connection: 2 min
- Import schema.sql: 1 min
- Verify tables and data: 1 min
- Test health endpoint: 1 min
- **Total: 6 minutes**

**You're one import away from a working app!** 🚀
