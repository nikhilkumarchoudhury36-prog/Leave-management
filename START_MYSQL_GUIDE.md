# How to Start MySQL Server on Windows

## Method 1: Using Windows Services (Most Common)

### Step-by-Step:

1. **Open Services Manager**
   - Press **Win + R** on your keyboard
   - Type: `services.msc`
   - Press **Enter**

2. **Find MySQL Service**
   - Scroll down the list to find one of these:
     - **MySQL**
     - **MySQL80** (if you have MySQL 8.0)
     - **MySQL57** (if you have MySQL 5.7)
   - Look at the "Status" column

3. **Start the Service**
   - If Status is blank or "Stopped":
     - Right-click on the MySQL service
     - Click **Start**
     - Wait a few seconds
     - Status should change to "Running"

4. **Make it Start Automatically** (Optional)
   - Right-click on the MySQL service
   - Click **Properties**
   - Change "Startup type" to **Automatic**
   - Click **OK**

## Method 2: Using Command Line

Open PowerShell **as Administrator**:

1. **Right-click Start menu**
2. Click **Windows PowerShell (Admin)** or **Terminal (Admin)**
3. Run this command:

```powershell
Start-Service MySQL80
```

Or try:
```powershell
Start-Service MySQL
```

## Method 3: Using XAMPP Control Panel (If you installed XAMPP)

1. **Open XAMPP Control Panel**
   - Find XAMPP in your Start menu
   - Or run: `C:\xampp\xampp-control.exe`

2. **Start MySQL**
   - Find the "MySQL" row
   - Click the **Start** button next to it
   - It should turn green and say "Running"

## Method 4: Using MySQL Installer

1. **Open MySQL Installer**
   - Search for "MySQL Installer" in Start menu
   - Or run: `C:\Program Files\MySQL\MySQL Installer for Windows\MySQLInstallerConsole.exe`

2. **Check Server Status**
   - Look for "MySQL Server" in the list
   - Check if it says "Running"
   - If not, there should be a "Start" or "Reconfigure" option

## Verify MySQL is Running

After starting MySQL, verify it's working:

### Test 1: Check Service Status
```powershell
Get-Service MySQL* | Select-Object Name, Status
```

You should see "Running"

### Test 2: Connect with Command Line
```powershell
mysql -u root -p
```

Enter your password. If you see `mysql>` prompt, it's working!

### Test 3: Test from Your App
```bash
node test-connection.js
```

Should show: "✓ Successfully connected to MySQL server!"

## Common Problems

### Problem: "Service not found"

**You might not have MySQL installed!**

Check if MySQL is installed:
```powershell
Get-Service MySQL* 
```

If nothing shows up, you need to install MySQL:
- Download from: https://dev.mysql.com/downloads/installer/
- Or install XAMPP: https://www.apachefriends.org/

### Problem: "Access is denied" when starting service

**You need Administrator privileges**

1. Close PowerShell
2. Right-click Start menu
3. Click "Windows PowerShell (Admin)"
4. Try the Start-Service command again

### Problem: Service starts but immediately stops

**MySQL configuration might be corrupted**

1. Check MySQL error log:
   - Usually at: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - Open the .err file with Notepad
   - Look for error messages

2. Common fixes:
   - Port 3306 might be in use by another program
   - Configuration file (my.ini) might have errors
   - Data directory might have permission issues

### Problem: "The service name is invalid"

**Find the exact service name:**

```powershell
Get-Service | Where-Object {$_.DisplayName -like "*MySQL*"}
```

Use the exact name shown in the "Name" column.

## After MySQL is Running

Once MySQL service shows "Running":

1. **Open MySQL Workbench again**
   - It should now show "Connected" or let you connect

2. **Import the schema** (see MYSQL_WORKBENCH_SETUP.md)

3. **Run setup script:**
   ```bash
   npm run setup
   ```

4. **Start your app:**
   ```bash
   npm start
   ```

5. **Open browser:**
   http://localhost:3001

## Quick Checklist

- [ ] MySQL service is "Running" in services.msc
- [ ] Can connect with: `mysql -u root -p`
- [ ] MySQL Workbench shows "Connected"
- [ ] test-connection.js shows success
- [ ] Database schema imported
- [ ] npm run setup completed
- [ ] npm start running
- [ ] Can access http://localhost:3001

## Still Not Working?

Run these diagnostic commands and share the output:

```powershell
# Check if MySQL service exists
Get-Service MySQL*

# Check if port 3306 is listening
netstat -an | findstr 3306

# Test connection
node test-connection.js
```

This will help identify the exact problem!
