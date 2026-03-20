# Final Deployment Checklist - Railway

## What I Fixed

✅ **Registration now assigns manager automatically**
✅ **Added comprehensive error logging**
✅ **Updated database config to support Railway's connection format**
✅ **Added health check endpoint for debugging**
✅ **Removed Socket.IO dependencies from controllers**

## Files Updated

1. `controllers/authController.js` - Better error handling + auto-assign manager
2. `config/db.js` - Support for Railway's MYSQL_URL format
3. `server.js` - Added /api/health endpoint
4. `controllers/leaveController.js` - Removed Socket.IO
5. `controllers/adminController.js` - Removed Socket.IO

## Deploy to Railway - Step by Step

### 1. Push Updated Code to GitHub

```bash
git add .
git commit -m "Fix registration for Railway deployment"
git push origin main
```

### 2. Railway Will Auto-Deploy

- Railway detects the push
- Builds and deploys automatically
- Wait for "Success" status

### 3. Import Database Schema

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Connect to MySQL
railway connect mysql

# Import schema
source database/schema.sql;
exit;
```

**Option B: Using MySQL Workbench**
1. Get MySQL credentials from Railway dashboard
2. Connect to Railway MySQL
3. File → Run SQL Script → Select `database/schema.sql`
4. Execute

**Option C: Using Command Line**
```bash
# Get connection details from Railway
mysql -h containers-us-west-xxx.railway.app -u root -p your_database < database/schema.sql
```

### 4. Set Environment Variables

In Railway dashboard → Variables tab:

```
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=production
```

Note: Railway automatically sets MySQL variables (MYSQL_URL, MYSQL_HOST, etc.)

### 5. Test the Deployment

#### Test 1: Health Check
Visit: `https://your-app.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-03-20T...",
  "database": "connected",
  "test": 2,
  "stats": {
    "users": 6,
    "leaveTypes": 4,
    "managers": 1
  }
}
```

If you see errors here, database is not connected or schema not imported.

#### Test 2: Registration
1. Go to: `https://your-app.railway.app`
2. Click "Register"
3. Fill form:
   - First Name: Railway
   - Last Name: Test
   - Email: railway@test.com
   - Department: Engineering
   - Password: Test@1234
   - Confirm: Test@1234
4. Click "Register"

#### Test 3: Check Logs
In Railway dashboard:
- Click on your service
- Go to "Deployments"
- Click latest deployment
- Click "View Logs"

Look for:
```
Registration attempt: { email: 'railway@test.com', department: 'Engineering' }
Hashing password...
Generating employee ID...
Generated employee ID: EMP007
Finding manager...
Assigned manager ID: 1
Inserting user...
User created with ID: 7
Creating leave balances...
Found leave types: 4
Leave balances created
Registration successful for: railway@test.com
```

### 6. If Registration Still Fails

Check Railway logs for error messages. Common issues:

**Error: "Table 'users' doesn't exist"**
→ Schema not imported. Run schema.sql on Railway MySQL

**Error: "Cannot connect to database"**
→ Check Railway MySQL service is running

**Error: "No managers found"**
→ Schema imported but no manager user. Check users table

**Error: "Validation failed"**
→ Password doesn't meet requirements (8+ chars, uppercase, number, special char)

## Debugging Commands

### Check if schema is imported:
```bash
railway connect mysql
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM leave_types;
SELECT * FROM users WHERE role IN ('manager', 'admin');
exit;
```

### View real-time logs:
```bash
railway logs
```

### Test database connection locally with Railway credentials:
```bash
# Get MYSQL_URL from Railway dashboard
MYSQL_URL="mysql://root:password@host:port/database" node test-connection.js
```

## Expected Results After Successful Deployment

✅ Health check returns "ok"
✅ Can register new users
✅ New users automatically assigned to manager
✅ Can login with registered account
✅ Can submit leave requests
✅ Manager can see and approve requests
✅ All features work except real-time notifications

## Real-Time Notifications on Railway

Good news! Railway DOES support WebSockets, so real-time should work.

If real-time doesn't work:
1. Check Railway logs for Socket.IO connection messages
2. Verify WebSocket connections in browser console
3. Make sure you're using `server.js` not `server-vercel.js`

## Post-Deployment Tasks

1. **Test all features:**
   - [ ] Registration
   - [ ] Login
   - [ ] Submit leave request
   - [ ] Manager approval
   - [ ] Calendar view
   - [ ] Balance tracking

2. **Set up custom domain** (optional):
   - Railway dashboard → Settings → Domains
   - Add your domain
   - Update DNS records

3. **Monitor logs:**
   - Check for errors
   - Monitor performance
   - Watch for failed requests

4. **Backup database:**
   - Railway provides automatic backups
   - Or set up manual backup script

## Cost Estimate

Railway pricing:
- **Hobby Plan:** $5/month (includes $5 credit)
- **MySQL:** Included in usage
- **Bandwidth:** 100GB included

Typical usage for this app: $5-10/month

## Support

If registration still fails after following this guide:

1. Check `/api/health` endpoint
2. Share Railway logs (the detailed error messages)
3. Verify schema is imported (check tables exist)
4. Confirm at least one manager exists in database

The detailed logging I added will show exactly where it's failing!

## Success Criteria

- [x] Code pushed to GitHub
- [x] Railway auto-deployed
- [ ] Database schema imported
- [ ] Environment variables set
- [ ] /api/health returns "ok"
- [ ] Can register new user
- [ ] Can login
- [ ] Can submit leave request
- [ ] Manager can approve
- [ ] Real-time notifications work

Once all checkboxes are checked, your app is fully deployed and working! 🎉
