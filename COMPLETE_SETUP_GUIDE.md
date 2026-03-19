# Complete Setup Guide - From Zero to Running

## Part 1: Install MySQL (if not installed)

### Check if MySQL is Installed

Open PowerShell and run:
```powershell
mysql --version
```

If you see a version number, MySQL is installed. Skip to Part 2.

If you see "not recognized", you need to install MySQL:

### Install MySQL Server

**Option A: MySQL Installer (Recommended)**

1. Go to: https://dev.mysql.com/downloads/installer/
2. Download "mysql-installer-community" (Windows MSI Installer)
3. Run the installer
4. Choose "Developer Default" or "Server only"
5. Click "Next" through the installation
6. **IMPORTANT:** When asked to set root password, remember it! You'll need it.
7. Keep default port 3306
8. Complete the installation

**Option B: XAMPP (Easier for beginners)**

1. Go to: https://www.apachefriends.org/
2. Download XAMPP for Windows
3. Install it
4. Open XAMPP Control Panel
5. Click "Start" next to MySQL
6. Default credentials: username=root, password=(empty)

## Part 2: Verify MySQL is Running

### Check MySQL Service

1. Press **Win + R**
2. Type: `services.msc`
3. Press Enter
4. Look for **MySQL** or **MySQL80** in the list
5. Status should be "Running"
6. If not, right-click → **Start**

### Test MySQL Connection

Open PowerShell and try:
```powershell
mysql -u root -p
```

Enter your password. If you see `mysql>` prompt, it's working!

Type `exit` to quit.

## Part 3: Configure Your Application

### 1. Check Your .env File

Open the `.env` file in your project folder and make sure it has:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=leave_management
DB_PORT=3306
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production_12345
PORT=3001
```

**IMPORTANT:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

If you're using XAMPP and didn't set a password, leave it empty:
```
DB_PASSWORD=
```

### 2. Test Database Connection

Run this test script:
```bash
node test-connection.js
```

This will tell you exactly what's wrong if there's a connection issue.

## Part 4: Set Up the Database

### Method 1: Using MySQL Workbench (GUI - Easiest)

**Step 1: Open MySQL Workbench**
- Launch MySQL Workbench application

**Step 2: Connect to Server**
- You should see a connection box (usually "Local instance MySQL80")
- Double-click it
- Enter your root password
- You should see the main interface

**Step 3: Import Schema**
- Click **File** menu at the top
- Click **Open SQL Script...**
- Navigate to your project: `D:\management\database\schema.sql`
- Click **Open**
- You'll see the SQL code in the editor
- Click the **lightning bolt icon** (⚡) in the toolbar (or press Ctrl+Shift+Enter)
- Wait for it to finish (you'll see "OK" messages in the output panel)

**Step 4: Verify**
- Look at the left sidebar under "SCHEMAS"
- Click the refresh icon (🔄)
- You should see `leave_management` database
- Expand it → Expand "Tables"
- You should see 5 tables: users, leave_types, leave_balances, leave_requests, holidays

### Method 2: Using Command Line

Open PowerShell in your project folder:

```bash
mysql -u root -p < database/schema.sql
```

Enter your password when prompted.

### Method 3: Using phpMyAdmin (if using XAMPP)

1. Open browser: http://localhost/phpmyadmin
2. Click "Import" tab
3. Click "Choose File"
4. Select `D:\management\database\schema.sql`
5. Scroll down and click "Go"
6. You should see "Import has been successfully finished"

## Part 5: Set Up User Passwords

After the database is created, run:

```bash
npm run setup
```

You should see:
```
Connected to database...
Updating user passwords...
✓ User passwords updated successfully!
```

## Part 6: Start the Application

```bash
npm start
```

You should see:
```
Server running on http://localhost:3001
```

## Part 7: Test the Application

1. Open browser: **http://localhost:3001**

2. You should see the login page

3. Try logging in:
   - Email: `manager@company.com`
   - Password: `Admin@123`

4. If login works, you're done! 🎉

## Common Issues and Solutions

### Issue 1: "ECONNREFUSED" or "Can't connect to MySQL"

**Solution:**
- MySQL service is not running
- Press Win+R → type `services.msc` → Find MySQL → Right-click → Start
- Or open XAMPP Control Panel → Start MySQL

### Issue 2: "Access denied for user 'root'"

**Solution:**
- Wrong password in .env file
- Open `.env` and update `DB_PASSWORD=your_correct_password`
- If using XAMPP with no password, use: `DB_PASSWORD=`

### Issue 3: "Database 'leave_management' doesn't exist"

**Solution:**
- The schema.sql wasn't imported
- Follow Part 4 again carefully
- Make sure you see "OK" messages after running the script

### Issue 4: "npm is not recognized"

**Solution:**
- Node.js is not installed or not in PATH
- Download from: https://nodejs.org/
- Install it
- Restart your terminal
- Try again

### Issue 5: Port 3000 or 3001 already in use

**Solution:**
- Change PORT in .env to 3002 or 3003
- Restart the server

### Issue 6: Registration fails with "Registration failed"

**Solution:**
- Database tables don't exist
- Run the test: `node test-connection.js`
- It will tell you exactly what's missing

## Step-by-Step Checklist

Use this checklist to track your progress:

- [ ] MySQL is installed
- [ ] MySQL service is running (check services.msc)
- [ ] Node.js is installed (run: `node --version`)
- [ ] Dependencies installed (run: `npm install`)
- [ ] .env file exists with correct MySQL password
- [ ] Test connection works (run: `node test-connection.js`)
- [ ] Database schema imported (using Workbench or command line)
- [ ] User passwords set up (run: `npm run setup`)
- [ ] Server started (run: `npm start`)
- [ ] Can access http://localhost:3001
- [ ] Can login with manager@company.com / Admin@123

## Still Having Issues?

Run this diagnostic command and share the output:

```bash
node test-connection.js
```

This will tell you exactly what step is failing and how to fix it.

## Quick Video Tutorial Reference

If you prefer video guides, search YouTube for:
- "How to install MySQL on Windows"
- "MySQL Workbench tutorial for beginners"
- "How to import SQL file in MySQL Workbench"

## Need More Help?

The test-connection.js script will give you specific error messages. Run it and it will tell you exactly what's wrong and how to fix it.
