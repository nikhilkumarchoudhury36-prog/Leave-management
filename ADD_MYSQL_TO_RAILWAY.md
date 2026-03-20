# Adding MySQL to Railway Project

## Error: "Service mysql not found"

This means you haven't added a MySQL database to your Railway project yet.

## Solution: Add MySQL Database

### Step 1: Add MySQL to Your Railway Project

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Click on your project

2. **Add MySQL Service:**
   - Click the **"+ New"** button
   - Select **"Database"**
   - Click **"Add MySQL"**
   - Railway will create and start the MySQL service

3. **Wait for MySQL to Deploy:**
   - You'll see "MySQL" service appear in your project
   - Wait for it to show "Active" status (green)

### Step 2: Link MySQL to Your App

Railway should automatically link the MySQL service to your app and add these environment variables:
- `MYSQL_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

**To verify:**
1. Click on your app service (not MySQL)
2. Go to "Variables" tab
3. You should see the MySQL variables listed

### Step 3: Get MySQL Connection Details

1. **Click on the MySQL service** in your Railway project
2. **Go to "Connect" tab**
3. You'll see connection details:
   ```
   Host: containers-us-west-xxx.railway.app
   Port: 6543
   Username: root
   Password: xxxxxxxxxx
   Database: railway
   ```

### Step 4: Import Schema

Now you have 3 options:

#### Option A: Using Railway CLI (Try Again)

```bash
# List services to see the exact name
railway status

# Connect using the exact service name shown
railway connect MySQL
# or
railway connect postgres
# or whatever name is shown
```

#### Option B: Using MySQL Command Line

```bash
# Use the connection details from Step 3
mysql -h containers-us-west-xxx.railway.app -P 6543 -u root -p railway < database/schema.sql

# When prompted, enter the password from Railway dashboard
```

#### Option C: Using MySQL Workbench (Easiest)

1. **Open MySQL Workbench**

2. **Create New Connection:**
   - Click "+" next to "MySQL Connections"
   - Connection Name: `Railway MySQL`
   - Hostname: (from Railway Connect tab)
   - Port: (from Railway Connect tab)
   - Username: `root`
   - Password: Click "Store in Vault" and enter password

3. **Test Connection:**
   - Click "Test Connection"
   - Should say "Successfully connected"

4. **Import Schema:**
   - Double-click the connection to open
   - File → Open SQL Script
   - Select: `D:\management\database\schema.sql`
   - Click the lightning bolt ⚡ to execute
   - Wait for "OK" messages

5. **Verify:**
   - Refresh schemas (click 🔄)
   - You should see tables: users, leave_types, etc.

### Step 5: Verify Schema Import

**Check via Railway Dashboard:**
1. Click MySQL service
2. Go to "Data" tab (if available)
3. You should see your tables

**Or check via your app:**
Visit: `https://your-app.railway.app/api/health`

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

### Step 6: Redeploy Your App (if needed)

If you just added MySQL:
1. Go to your app service
2. Click "Settings"
3. Scroll to "Service"
4. Click "Redeploy" (or push new code to GitHub)

---

## Alternative: Use Railway's Web-Based MySQL Client

Some Railway projects have a web-based MySQL client:

1. Click on MySQL service
2. Look for "Query" or "Data" tab
3. If available, you can paste and run SQL directly:
   - Copy contents of `database/schema.sql`
   - Paste into query editor
   - Click "Run"

---

## Troubleshooting

### "Can't connect to MySQL server"

**Cause:** MySQL service not running or wrong credentials

**Solution:**
1. Check MySQL service is "Active" in Railway
2. Verify connection details are correct
3. Check firewall isn't blocking connection

### "Access denied for user"

**Cause:** Wrong password

**Solution:**
1. Get fresh password from Railway dashboard
2. MySQL service → Connect tab → Copy password
3. Try again

### "Unknown database"

**Cause:** Database name is wrong

**Solution:**
Use the database name from Railway (usually "railway")

---

## Quick Command Reference

```bash
# Check Railway services
railway status

# List all services
railway service

# Connect to MySQL (try different names)
railway connect mysql
railway connect MySQL  
railway connect database

# Get MySQL credentials
railway variables

# Import schema using mysql command
mysql -h HOST -P PORT -u root -p DATABASE < database/schema.sql
```

---

## What to Do After Adding MySQL

1. ✅ MySQL service added and active
2. ✅ Schema imported (tables created)
3. ✅ App redeployed (if needed)
4. ✅ Test `/api/health` endpoint
5. ✅ Try registration again

Registration should work now!

---

## Still Having Issues?

Share:
1. Screenshot of your Railway project dashboard (showing services)
2. Output of `railway status`
3. Response from `/api/health` endpoint

I can help you debug further!
