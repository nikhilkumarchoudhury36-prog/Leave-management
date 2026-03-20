# Railway Database Import - Step by Step with Screenshots Guide

## What You're Doing

Copying database tables from your local computer to Railway's MySQL.

---

## EASIEST METHOD: Railway Query Tab

### Step 1: Open Railway Dashboard

1. Open your browser
2. Go to: **https://railway.app**
3. You should see your project

### Step 2: Click MySQL Service

1. You'll see two services:
   - **Leave-management** (your app)
   - **MySQL** (your database)
2. Click on **MySQL** (the database one)

### Step 3: Find the Query Tab

After clicking MySQL, you'll see several tabs at the top:
- Overview
- Deployments
- **Query** ← Click this one
- Connect
- Variables
- Settings

Click on **"Query"** tab.

### Step 4: You'll See a SQL Editor

It looks like a text box where you can type SQL commands.

There might be a button that says:
- "Run Query" or
- "Execute" or
- Just a play button ▶️

### Step 5: Open Schema File on Your Computer

1. Open File Explorer
2. Go to: `D:\management\database\`
3. Find file: `schema-railway.sql`
4. Right-click → Open with → Notepad (or any text editor)

### Step 6: Copy Everything

1. In the opened file, press **Ctrl+A** (selects all text)
2. Press **Ctrl+C** (copies it)

### Step 7: Paste into Railway Query Tab

1. Go back to Railway browser tab
2. Click in the Query text box
3. Press **Ctrl+V** (pastes the SQL)
4. You should see all the SQL code

### Step 8: Run the Query

1. Click the **"Run"** or **"Execute"** button
2. Wait 5-10 seconds
3. You should see output messages like:
   - "Query executed successfully"
   - "5 rows affected"
   - "4 rows affected"
   - etc.

### Step 9: Verify It Worked

1. Clear the query box
2. Type this simple query:
```sql
SELECT COUNT(*) FROM users;
```
3. Click Run
4. Should show: **5**

**If you see 5: ✅ SUCCESS! Database is imported!**

---

## Alternative: If Railway Doesn't Have Query Tab

Some Railway plans might not have a Query tab. In that case:

### Use Railway CLI Method

#### Step 1: Install Railway CLI

Open PowerShell and run:
```bash
npm install -g @railway/cli
```

Wait for installation to complete.

#### Step 2: Login to Railway

```bash
railway login
```

A browser window will open. Click "Authorize" or "Login".

#### Step 3: Link Your Project

```bash
cd D:\management
railway link
```

You'll see a list of your projects. Use arrow keys to select yours, press Enter.

#### Step 4: Connect to MySQL

```bash
railway connect mysql
```

You'll see a MySQL prompt like:
```
mysql>
```

#### Step 5: Import the Schema

At the `mysql>` prompt, type:
```sql
source database/schema-railway.sql
```

Press Enter. Wait for it to complete (5-10 seconds).

#### Step 6: Verify

At the `mysql>` prompt, type:
```sql
SELECT COUNT(*) FROM users;
```

Should show: 5

Type `exit` to close.

---

## After Import: Test Your Railway App

### Step 1: Check Health Endpoint

1. Go to Railway dashboard
2. Click "Leave-management" service
3. Go to "Settings" tab
4. Find your app URL (looks like: `https://something.railway.app`)
5. Copy that URL
6. In browser, go to: `https://your-url.railway.app/api/health`

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

**If you see this: ✅ Database is working!**

### Step 2: Test Login

1. Go to: `https://your-url.railway.app`
2. You should see the login page
3. Try logging in:
   - Email: `manager@company.com`
   - Password: `Admin@123`
4. Click "Login"

**Expected: Redirects to manager dashboard**

### Step 3: Test Registration

1. Go back to login page
2. Click "Register" link
3. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test@123
   - Department: IT
4. Click "Register"

**Expected: "Registration successful" message**

---

## Troubleshooting

### Problem: Can't find Query tab in Railway

**Solution:** Use Railway CLI method instead (see above)

### Problem: Railway CLI not installing

**Error:** `npm: command not found`

**Solution:** You need Node.js installed. You already have it (you ran npm install before). Try:
```bash
npm --version
```

If it shows a version, npm is working. Try the install command again.

### Problem: Query execution fails

**Error:** "Table already exists"

**Solution:** First run this to clean up:
```sql
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;
```

Then run the full schema again.

### Problem: Health endpoint shows 0 users

**Possible cause:** Schema imported to wrong database

**Solution:** In Railway Query tab, run:
```sql
USE railway;
SELECT COUNT(*) FROM users;
```

Should show 5. If it shows error "table doesn't exist", the import didn't work.

---

## Quick Checklist

- [ ] Opened Railway dashboard
- [ ] Clicked MySQL service
- [ ] Found Query tab (or installed Railway CLI)
- [ ] Copied schema-railway.sql content
- [ ] Pasted and executed in Railway
- [ ] Verified users count = 5
- [ ] Tested health endpoint (shows users: 5)
- [ ] Tested login (works with manager@company.com)
- [ ] Tested registration (creates new user)

---

## Need More Help?

Tell me exactly where you're stuck:

1. **Can't find Query tab?**
   - Tell me what tabs you see in Railway MySQL service
   - I'll guide you to use CLI instead

2. **Query execution fails?**
   - Copy the error message
   - Share it with me

3. **Railway CLI not working?**
   - Share the error message
   - We'll troubleshoot

4. **Import seems successful but health endpoint fails?**
   - Share the health endpoint response
   - We'll check the connection

I'm here to help! Just tell me what's not working.
