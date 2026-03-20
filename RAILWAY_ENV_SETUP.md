# Railway Environment Variables Setup

## Critical: Add JWT_SECRET to Railway

Your app WILL NOT WORK without this variable!

### Step-by-Step:

1. **Go to Railway Dashboard:** https://railway.app
2. **Click "Leave-management" service**
3. **Go to "Variables" tab**
4. **Click "New Variable"**
5. **Add this variable:**

```
Variable Name: JWT_SECRET
Variable Value: my_super_secret_jwt_key_change_this_in_production_12345
```

6. **Click "Add"**
7. Railway will automatically redeploy

## All Required Environment Variables

Railway needs these variables to work:

### Automatically Set by Railway:

✅ `PORT` - Railway sets this automatically (don't add manually)
✅ `MYSQL_URL` - Set automatically when you add MySQL service
✅ `DATABASE_URL` - Alternative name for MySQL connection

### You MUST Add Manually:

❌ `JWT_SECRET` - Required for authentication

### Optional (for production):

- `NODE_ENV=production` - Enables production mode

## How to Verify Variables

1. Click "Leave-management" service
2. Go to "Variables" tab
3. You should see:
   - `MYSQL_URL` (from MySQL service)
   - `JWT_SECRET` (you added this)
   - `PORT` (Railway adds this)

## What Each Variable Does

### JWT_SECRET
**Purpose:** Signs and verifies authentication tokens

**Used in:** `controllers/authController.js`

**What happens without it:**
- Login fails
- Registration fails
- Token verification fails

**Error you'll see:**
```
secretOrPrivateKey must have a value
```

### MYSQL_URL
**Purpose:** Connects to Railway MySQL database

**Format:** `mysql://root:password@host:port/railway`

**Used in:** `config/db.js`

**What happens without it:**
- Database connection fails
- All API calls fail
- Health check fails

**Error you'll see:**
```
Error: connect ECONNREFUSED
```

### PORT
**Purpose:** Tells server which port to listen on

**Set by:** Railway automatically

**Used in:** `server.js`

**What happens without it:**
- Server uses default port 3000
- Railway can't route traffic to your app

## Testing Variables

After adding variables, test with health endpoint:

```
https://your-app.railway.app/api/health
```

**Success response:**
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

**If database connection fails:**
```json
{
  "status": "error",
  "message": "connect ECONNREFUSED"
}
```
→ Check MYSQL_URL exists

**If JWT error:**
Check Railway logs for:
```
secretOrPrivateKey must have a value
```
→ Add JWT_SECRET variable

## Railway Auto-Redeploy

When you add/change variables, Railway automatically:
1. Stops current deployment
2. Rebuilds with new variables
3. Starts new deployment

This takes 1-2 minutes.

## Local vs Railway Variables

### Local (.env file):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=nikhil
DB_NAME=leave_management
DB_PORT=3306
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production_12345
PORT=3003
```

### Railway (Variables tab):
```
MYSQL_URL=mysql://root:xxx@containers-us-west-xxx.railway.app:6789/railway
JWT_SECRET=my_super_secret_jwt_key_change_this_in_production_12345
PORT=3000 (set by Railway)
```

Notice:
- Railway uses `MYSQL_URL` instead of individual DB variables
- Railway sets `PORT` automatically
- `JWT_SECRET` must be added manually

## Your config/db.js Handles Both

Your `config/db.js` is smart - it checks for Railway format first:

```javascript
if (process.env.MYSQL_URL) {
  // Use Railway's MYSQL_URL
} else {
  // Use local .env variables
}
```

This is why the same code works both locally and on Railway!

## Quick Checklist

Before testing on Railway:

- [ ] MySQL service added and "Online"
- [ ] MYSQL_URL variable exists (auto-added by MySQL service)
- [ ] JWT_SECRET variable added manually
- [ ] Latest code deployed (check Deployments tab)
- [ ] Deployment status is "Success" (green checkmark)
- [ ] Schema imported to Railway MySQL

Once all checked, registration should work!

## Common Mistakes

### Mistake 1: Adding DB_HOST, DB_USER, etc. to Railway

❌ Don't do this:
```
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxx
```

✅ Railway provides MYSQL_URL instead:
```
MYSQL_URL=mysql://root:xxx@host:port/railway
```

Your code handles this automatically!

### Mistake 2: Forgetting JWT_SECRET

This is the #1 reason registration fails on Railway!

**Always add JWT_SECRET manually.**

### Mistake 3: Wrong JWT_SECRET Value

Make sure it matches your local `.env` file, or use a new secure value for production.

**For testing:** Use the same value as local
**For production:** Generate a new secure secret

## Generate Secure JWT Secret (Optional)

For production, use a secure random secret:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as JWT_SECRET on Railway.

## Need Help?

If variables are set correctly but still not working:

1. Check Railway logs for errors
2. Test `/api/health` endpoint
3. Share the error message

The logs will tell us exactly what's wrong!
