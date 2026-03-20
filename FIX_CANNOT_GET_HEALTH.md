# Fix: "Cannot GET /api/health" on Railway

## The Problem

You're seeing "Cannot GET /api/health" when visiting your Railway app's health endpoint.

This means Railway is either:
1. Running old code that doesn't have the health endpoint
2. Not starting the server properly
3. Routing requests incorrectly

## The Solution

### Quick Check: Is Your Code Deployed?

Your local code has the health endpoint (I can see it in `server.js`), and it's been committed to GitHub. But Railway might not have deployed it yet.

**Check Railway Dashboard:**
1. Go to https://railway.app
2. Click your "Leave-management" service
3. Go to "Deployments" tab
4. Look at the latest deployment:
   - ✅ Green checkmark = Deployed successfully
   - 🔄 Building/Deploying = In progress
   - ❌ Red X = Failed

### If Deployment Failed

Click on the failed deployment and check logs for errors. Common issues:

**Error: Missing dependencies**
```
npm ERR! Cannot find module 'socket.io'
```
**Fix:** Already in package.json, should work

**Error: Port binding**
```
Error: listen EADDRINUSE
```
**Fix:** Railway handles this automatically, shouldn't happen

**Error: Database connection**
```
Error: connect ECONNREFUSED
```
**Fix:** Check MYSQL_URL variable exists

### If Deployment Succeeded But Still Getting 404

This is unusual. Let's debug:

#### Step 1: Check Railway Logs

```bash
# If you have Railway CLI installed:
railway logs

# Or in Railway dashboard:
# Click service → Deployments → Latest → View Logs
```

**Look for:**
```
Server running on http://localhost:XXXX
```

If you see this, server is running! The health endpoint should work.

**If you DON'T see this:**
- Server isn't starting
- Check for error messages in logs
- Share the error here

#### Step 2: Verify Environment Variables

1. Click "Leave-management" service
2. Go to "Variables" tab
3. Check these exist:
   - `MYSQL_URL` or `DATABASE_URL` (from MySQL service)
   - `JWT_SECRET` (you need to add this!)
   - `PORT` (Railway sets this automatically)

**Missing JWT_SECRET?**

Add it:
1. Click "New Variable"
2. Name: `JWT_SECRET`
3. Value: `my_super_secret_jwt_key_change_this_in_production_12345`
4. Click "Add"
5. Railway will auto-redeploy

#### Step 3: Check Service URL

Make sure you're using the correct URL:

1. Click "Leave-management" service
2. Go to "Settings" tab
3. Look for "Domains" section
4. Your URL should be: `https://something.railway.app`

**Try these URLs:**
- `https://your-app.railway.app/api/health` ← Should work
- `https://your-app.railway.app/` ← Should show login page
- `https://your-app.railway.app/index.html` ← Should show login page

### If NONE of the Above Work

The issue is likely that Railway isn't connected to your GitHub repo properly.

#### Reconnect GitHub:

1. In Railway dashboard, click "Leave-management" service
2. Go to "Settings" tab
3. Scroll to "Service Source"
4. Click "Disconnect" (if connected)
5. Click "Connect Repo"
6. Select your GitHub repository
7. Select branch: `main`
8. Click "Deploy"

This will trigger a fresh deployment from your GitHub code.

### Manual Deploy (If Auto-Deploy Isn't Working)

If Railway isn't auto-deploying when you push to GitHub:

1. Make a small change to trigger deploy:
   ```bash
   # Add a comment to server.js
   echo "// Trigger deploy" >> server.js
   git add server.js
   git commit -m "Trigger Railway deploy"
   git push origin main
   ```

2. Or manually trigger in Railway:
   - Click "Leave-management" service
   - Go to "Deployments" tab
   - Click "Deploy" button (top right)

### Test Locally First

Before debugging Railway, make sure it works locally:

```bash
# Start your local server
npm start

# In another terminal or browser:
curl http://localhost:3003/api/health

# Or visit in browser:
# http://localhost:3003/api/health
```

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

If this works locally but not on Railway, it's definitely a deployment issue.

## Common Railway Deployment Issues

### Issue 1: Wrong Start Command

**Check:** Railway should use `npm start` which runs `node server.js`

**Fix:**
1. Settings → "Start Command"
2. Should be: `npm start` or `node server.js`
3. If different, change it and redeploy

### Issue 2: Wrong Root Directory

**Check:** Railway should deploy from root directory

**Fix:**
1. Settings → "Root Directory"
2. Should be: `/` (empty or root)
3. If different, change it

### Issue 3: Build Command Issues

**Check:** Railway should run `npm install` automatically

**Fix:**
1. Settings → "Build Command"
2. Should be: `npm install` or empty (Railway auto-detects)

### Issue 4: Port Configuration

**Check:** Railway sets PORT environment variable automatically

Your `server.js` uses:
```javascript
const PORT = process.env.PORT || 3000;
```

This is correct! Railway will set PORT automatically.

## Still Not Working?

Share these details:

1. **Railway deployment status:** Success or Failed?
2. **Railway logs:** Copy the last 20 lines
3. **Environment variables:** List the variable names (not values)
4. **Service URL:** What's your Railway app URL?
5. **Local test:** Does `/api/health` work on localhost?

With this info, I can pinpoint the exact issue!

## Expected Working State

✅ Railway deployment: Success
✅ Railway logs: "Server running on..."
✅ Environment variables: MYSQL_URL, JWT_SECRET exist
✅ `/api/health`: Returns JSON with database stats
✅ `/`: Shows login page

Once health endpoint works, registration will work too!
