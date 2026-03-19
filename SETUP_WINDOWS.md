# Windows Setup Guide

## Prerequisites Installation

### 1. Install Node.js

Download and install Node.js from: https://nodejs.org/

Choose the LTS (Long Term Support) version. This will also install npm.

After installation, verify by opening a new terminal:
```bash
node --version
npm --version
```

### 2. Install MySQL

Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/

Or use XAMPP which includes MySQL: https://www.apachefriends.org/

After installation, verify MySQL is running:
```bash
mysql --version
```

## Application Setup

Once Node.js and MySQL are installed:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
copy .env.example .env
```

Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=leave_management
DB_PORT=3306
JWT_SECRET=my_super_secret_jwt_key_12345
PORT=3000
```

### 3. Create Database

Open MySQL command line:
```bash
mysql -u root -p
```

Then run:
```sql
source database/schema.sql
```

Or import directly:
```bash
mysql -u root -p < database/schema.sql
```

### 4. Set Up User Passwords
```bash
npm run setup
```

### 5. Start the Application
```bash
npm start
```

### 6. Access the Application

Open your browser: http://localhost:3000

**Login with:**
- Manager: manager@company.com / Admin@123
- Employee: emp1@company.com / Emp@1234

## Troubleshooting

### "npm is not recognized"
- Restart your terminal after installing Node.js
- Or restart your computer
- Verify Node.js is in your PATH

### "mysql is not recognized"
- Add MySQL bin folder to your PATH
- Usually: C:\Program Files\MySQL\MySQL Server 8.0\bin
- Or use MySQL Workbench GUI to import schema.sql

### Port 3000 already in use
Change PORT in .env to 3001 or another available port

### Database connection failed
- Verify MySQL service is running
- Check credentials in .env match your MySQL setup
- Test connection: `mysql -u root -p`

## Alternative: Use XAMPP

If you prefer an all-in-one solution:

1. Download XAMPP: https://www.apachefriends.org/
2. Install and start Apache + MySQL from XAMPP Control Panel
3. Use phpMyAdmin (http://localhost/phpmyadmin) to import schema.sql
4. Continue with npm install and npm start

## Need Help?

Check the main README.md for detailed documentation and API endpoints.
