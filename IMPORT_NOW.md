# Import Database to Railway - DO THIS NOW

## You Have: Railway MySQL with NO TABLES
## You Need: Import schema-railway.sql

---

## STEP 1: Get Railway MySQL Connection Details (1 minute)

1. Go to: https://railway.app
2. Click on **"MySQL"** service (the database icon)
3. Click **"Connect"** tab
4. You'll see something like this:

```
MYSQL_HOST=containers-us-west-123.railway.app
MYSQL_PORT=6789
MYSQL_USER=root
MYSQL_PASSWORD=AbCdEfGh123456
MYSQL_DATABASE=railway
```

**COPY THESE VALUES - You'll need them in Step 2!**

---

## STEP 2: Open MySQL Workbench (1 minute)

1. Open **MySQL Workbench** on your computer
2. Click the **"+"** icon next to "MySQL Connections"
3. Fill in the form:

```
Connection Name: Railway MySQL
Hostname: [paste MYSQL_HOST from Railway]
Port: [paste MYSQL_PORT from Railway]
Username: root
```

4. Click **"Store in Vault..."** button next to Password
5. Paste the **MYSQL_PASSWORD** from Railway
6. Click **"OK"**
7. Click **"Test Connection"**
   - Should say: "Successfully connected"
   - If fails: Double-check hostname, port, password
8. Click **"OK"** to save

---

## STEP 3: Connect to Railway MySQL (30 seconds)

1. **Double-click** on "Railway MySQL" connection
2. It will connect and show the database
3. In left sidebar, you'll see "railway" database
4. Expand it - "Tables" folder will be empty (that's the problem!)

---

## STEP 4: Import Schema File (1 minute)

1. Click **File** → **Open SQL Script**
2. Navigate to: `D:\management\database\schema-railway.sql`
3. Click **"Open"**
4. You'll see the SQL script in the editor

---

## STEP 5: Execute the Script (30 seconds)

1. Click the **lightning bolt ⚡ icon** in the toolbar
   - Or press **Ctrl+Shift+Enter**
2. Wait 5-10 seconds
3. You'll see output at the bottom:

```
Action Output:
OK, 0 rows affected
OK, 0 rows affected
OK, 5 rows affected    ← Users created!
OK, 4 rows affected    ← Leave types created!
OK, 20 rows affected   ← Leave balances created!
OK, 6 rows affected    ← Holidays created!
```

4. Look for the verification queries at the end:

```
Users created: 5
Leave types created: 4
Leave balances created: 20
Holidays created: 6
```

**If you see these numbers: ✅ SUCCESS!**

---

## STEP 6: Verify Tables Exist (30 seconds)

1. In left sidebar, click the **refresh icon** 🔄
2. Expand **"railway"** database
3. Expand **"Tables"** folder
4. You should now see:
   - ✅ holidays
   - ✅ leave_balances
   - ✅ leave_requests
   - ✅ leave_types
   - ✅ users

---

## STEP 7: Verify User Data (30 seconds)

1. Right-click on **"users"** table
2. Select **"Select Rows - Limit 1000"**
3. You should see 5 users:

| id | employee_id | email | role |
|----|-------------|-------|------|
| 1 | EMP001 | admin@company.com | admin |
| 2 | EMP002 | manager@company.com | manager |
| 3 | EMP003 | john.doe@company.com | employee |
| 4 | EMP004 | jane.smith@company.com | employee |
| 5 | EMP005 | bob.wilson@company.com | employee |

**All passwords are: Admin@123**

---

## STEP 8: Test Railway App (1 minute)

### Test Health Endpoint

1. Open browser
2. Go to: `https://your-app-name.railway.app/api/health`
3. You should see:

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

**If you see "users": 5 → ✅ DATABASE IS WORKING!**

### Test Registration

1. Go to: `https://your-app-name.railway.app`
2. Click **"Register"**
3. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test@123
   - Department: IT
4. Click **"Register"**

**Expected: "Registration successful" message**

### Test Login

1. Try manager account:
   - Email: `manager@company.com`
   - Password: `Admin@123`
2. Should redirect to manager dashboard

**If all three tests pass: ✅ EVERYTHING IS WORKING!**

---

## Troubleshooting

### Can't connect to Railway MySQL

**Error:** "Access denied" or "Connection refused"

**Fix:**
1. Check MySQL service is "Online" (green dot) in Railway
2. Copy-paste password again (don't type it)
3. Verify hostname and port are correct

### Schema import fails

**Error:** "Table already exists"

**Fix:** The script already has DROP TABLE statements, so this shouldn't happen. If it does:
1. In MySQL Workbench, run this first:
```sql
USE railway;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
```
2. Then run schema-railway.sql again

### Health endpoint shows 0 users

**Possible causes:**
1. Schema imported to wrong database
2. Connected to wrong MySQL instance

**Fix:**
1. In MySQL Workbench, verify you're connected to Railway (not localhost)
2. Check you're using "railway" database (not "leave_management")
3. Run: `SELECT COUNT(*) FROM users;` - should return 5

---

## Quick Checklist

- [ ] Got Railway MySQL connection details
- [ ] Created MySQL Workbench connection to Railway
- [ ] Tested connection (success)
- [ ] Opened schema-railway.sql
- [ ] Executed script (saw "OK" messages)
- [ ] Verified 5 tables exist
- [ ] Verified 5 users in users table
- [ ] Health endpoint returns users: 5
- [ ] Registration works
- [ ] Login works

---

## Total Time: ~5 minutes

**You're literally 5 minutes away from a working app!**

Just follow these 8 steps and you're done. 🚀
