# MySQL Workbench Setup Guide - Step by Step

## Step 1: Install MySQL Workbench

If you don't have MySQL Workbench installed:

1. Download from: https://dev.mysql.com/downloads/workbench/
2. Choose your Windows version (usually Windows x64)
3. Click "Download" (you can skip the login by clicking "No thanks, just start my download")
4. Run the installer and follow the prompts
5. Launch MySQL Workbench after installation

## Step 2: Connect to MySQL Server

1. **Open MySQL Workbench**
   - You should see the home screen with "MySQL Connections"

2. **Create a New Connection** (if you don't have one)
   - Click the **[+]** icon next to "MySQL Connections"
   - Enter connection details:
     - **Connection Name**: Local MySQL (or any name you like)
     - **Hostname**: localhost
     - **Port**: 3306
     - **Username**: root
     - **Password**: Click "Store in Vault..." and enter your MySQL password
   - Click **Test Connection** to verify
   - Click **OK** to save

3. **Connect to Your Server**
   - Double-click on your connection (e.g., "Local MySQL")
   - Enter your password if prompted
   - You should now see the main Workbench interface

## Step 3: Import the Database Schema

### Method A: Using SQL Script (Recommended)

1. **Open the SQL Script**
   - Click **File** → **Open SQL Script...**
   - Navigate to your project folder: `D:\management`
   - Select the file: `database/schema.sql`
   - Click **Open**

2. **Review the Script**
   - You'll see the SQL code in the editor
   - This script will:
     - Create the database `leave_management`
     - Create 5 tables (users, leave_types, leave_balances, leave_requests, holidays)
     - Insert sample data

3. **Execute the Script**
   - Click the **lightning bolt icon** (⚡) in the toolbar
   - Or press **Ctrl + Shift + Enter**
   - Or click **Query** → **Execute (All or Selection)**

4. **Check for Success**
   - Look at the **Output** panel at the bottom
   - You should see messages like:
     ```
     CREATE DATABASE IF NOT EXISTS leave_management    OK
     CREATE TABLE users                                 OK
     INSERT INTO users                                  5 rows affected
     ```
   - If you see any errors in red, read them carefully

### Method B: Using Data Import Wizard

1. **Start the Import**
   - Click **Server** → **Data Import**

2. **Select Import Options**
   - Choose **Import from Self-Contained File**
   - Click the **[...]** button
   - Navigate to: `D:\management\database\schema.sql`
   - Select it and click **Open**

3. **Choose Target Schema**
   - Under "Default Target Schema"
   - Select **New...** button
   - Enter: `leave_management`
   - Click **OK**

4. **Start Import**
   - Click **Start Import** button at the bottom right
   - Wait for the import to complete
   - Check the log for any errors

## Step 4: Verify the Database

1. **Refresh the Schemas**
   - In the left sidebar, find **SCHEMAS** panel
   - Click the **refresh icon** (🔄) at the top of the panel

2. **Expand the Database**
   - You should now see `leave_management` in the list
   - Click the **▶** arrow next to it to expand

3. **Check Tables**
   - Click **▶** next to **Tables**
   - You should see 5 tables:
     - ✓ holidays
     - ✓ leave_balances
     - ✓ leave_requests
     - ✓ leave_types
     - ✓ users

4. **Verify Data**
   - Right-click on **users** table
   - Select **Select Rows - Limit 1000**
   - You should see 5 users:
     - EMP001 - John Manager (manager)
     - EMP002 - Alice Smith (employee)
     - EMP003 - Bob Johnson (employee)
     - EMP004 - Carol Williams (employee)
     - EMP005 - David Brown (employee)

## Step 5: Update User Passwords

The passwords in the database need to be properly hashed. 

1. **Go back to your terminal/command prompt**

2. **Run the setup script:**
   ```bash
   npm run setup
   ```

3. **You should see:**
   ```
   Connected to database...
   Updating user passwords...
   ✓ User passwords updated successfully!

   Default credentials:
   Manager: manager@company.com / Admin@123
   Employees: emp1@company.com ... emp4@company.com / Emp@1234
   ```

## Step 6: Test the Application

1. **Open your browser**
   - Go to: http://localhost:3001

2. **Try logging in with:**
   - **Manager Account:**
     - Email: `manager@company.com`
     - Password: `Admin@123`
   
   - **Employee Account:**
     - Email: `emp1@company.com`
     - Password: `Emp@1234`

3. **Or register a new account:**
   - Click the "Register" tab
   - Fill in the form
   - Submit

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Your MySQL password in `.env` file is incorrect
- Open `.env` file and update `DB_PASSWORD=your_actual_password`

### Error: "Can't connect to MySQL server"
- MySQL service is not running
- **Start MySQL:**
  - Press **Win + R**
  - Type: `services.msc`
  - Find **MySQL** or **MySQL80** in the list
  - Right-click → **Start**

### Error: "Database 'leave_management' doesn't exist"
- The schema import didn't work
- Try Method B (Data Import Wizard) instead
- Or manually create the database:
  ```sql
  CREATE DATABASE leave_management;
  USE leave_management;
  ```
  Then run the schema.sql script again

### Error: "Table 'users' doesn't exist"
- The tables weren't created
- Make sure you selected the entire script before executing
- Try running the script again

### Can't see the database in Workbench
- Click the refresh icon (🔄) in the SCHEMAS panel
- Or close and reopen MySQL Workbench

## Quick Reference

**Your Database Details:**
- Database Name: `leave_management`
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: (whatever you set during MySQL installation)

**Application Details:**
- URL: http://localhost:3001
- Default Manager: manager@company.com / Admin@123
- Default Employee: emp1@company.com / Emp@1234

## Next Steps

Once the database is set up and passwords are updated:

1. ✓ Server is running on port 3001
2. ✓ Database is created with all tables
3. ✓ Sample data is loaded
4. ✓ Passwords are properly hashed
5. → **You can now use the application!**

Open http://localhost:3001 and start managing leaves!
