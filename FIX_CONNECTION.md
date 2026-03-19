# Fix Your Database Connection - Simple Steps

## Good News!
✓ MySQL is installed and running (MySQL96 service is active)

## The Problem
Your `.env` file has an empty password, but your MySQL root account requires a password.

## The Solution

### Step 1: Find Your MySQL Password

Try these common passwords:
- The password you set during MySQL installation
- `root`
- `admin`
- `password`
- `mysql`
- (empty - no password)

### Step 2: Test Each Password

Open PowerShell and try connecting:

```powershell
mysql -u root -p
```

When prompted, enter a password. If it works, you'll see:
```
mysql>
```

Type `exit` to quit.

### Step 3: Update .env File

Once you find the correct password, open `.env` file and update this line:

**If your password is "mypassword":**
```
DB_PASSWORD=mypassword
```

**If there's no password (unlikely but possible):**
```
DB_PASSWORD=
```

### Step 4: Test the Connection

```bash
node test-connection.js
```

You should see:
```
✓ Successfully connected to MySQL server!
```

## If You Don't Know the Password

### Option A: Reset the Password

1. **Open MySQL Workbench**

2. **Try connecting without password:**
   - Click the connection
   - Leave password blank
   - Click OK

3. **If that doesn't work, create a new connection:**
   - Click the [+] icon next to "MySQL Connections"
   - Connection Name: `Local MySQL`
   - Hostname: `localhost`
   - Port: `3306`
   - Username: `root`
   - Click "Store in Vault..." next to Password
   - Try different passwords or leave empty
   - Click "Test Connection"
   - Keep trying until it works!

### Option B: Use MySQL Command Line Client

1. **Find MySQL Command Line Client in Start Menu**
   - Search for "MySQL Command Line Client"
   - Or "MySQL 9.6 Command Line Client"

2. **Open it**
   - It will ask for password
   - Try your passwords
   - If one works, that's your password!

## After You Connect Successfully

### Step 1: Import the Database

In MySQL Workbench:
1. File → Open SQL Script
2. Select: `D:\management\database\schema.sql`
3. Click the lightning bolt ⚡ to execute
4. Wait for "OK" messages

### Step 2: Set Up Passwords

In PowerShell:
```bash
npm run setup
```

### Step 3: Start the Server

```bash
npm start
```

### Step 4: Open the App

Browser: http://localhost:3001

Login with:
- Email: `manager@company.com`
- Password: `Admin@123`

## Quick Diagnostic

Run this to see what's wrong:

```bash
node test-connection.js
```

It will tell you exactly what to fix!

## Need to Change MySQL Root Password?

If you want to set a new password:

1. **Connect to MySQL** (using current password)
2. **Run this command:**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewPassword123';
   FLUSH PRIVILEGES;
   ```
3. **Update .env file** with the new password
4. **Test:** `node test-connection.js`
