# Deploying to Vercel - Complete Guide

## ⚠️ Important Limitations on Vercel

Vercel is a **serverless platform**, which means:

❌ **Real-time features (Socket.IO) will NOT work** - Vercel doesn't support WebSocket connections
❌ **Each request runs in isolation** - No persistent server state
✅ **REST API will work fine** - All CRUD operations work
✅ **Static files served** - HTML, CSS, JS work perfectly

## What Will Work:
- ✅ User registration and login
- ✅ Leave request submission
- ✅ Manager approval/rejection
- ✅ Dashboard views
- ✅ Calendar and balance tracking
- ❌ Real-time notifications (will need page refresh)

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Account** - To connect your repository
3. **Remote MySQL Database** - Vercel can't host MySQL

## Step 1: Set Up Remote MySQL Database

You need a cloud MySQL database. Options:

### Option A: PlanetScale (Recommended - Free Tier)
1. Go to https://planetscale.com
2. Sign up for free account
3. Create new database: `leave_management`
4. Get connection details:
   - Host
   - Username
   - Password
   - Database name
5. Import your schema using their web console or CLI

### Option B: Railway (Free Tier)
1. Go to https://railway.app
2. Sign up and create new project
3. Add MySQL database
4. Get connection details
5. Import schema

### Option C: AWS RDS / Azure / Google Cloud
- More complex but production-ready
- Follow their MySQL setup guides

## Step 2: Import Database Schema

Once you have remote MySQL:

```bash
# Using MySQL command line
mysql -h your-host.com -u username -p database_name < database/schema.sql

# Or use MySQL Workbench
# File → Run SQL Script → Select schema.sql
```

## Step 3: Remove Socket.IO (Not Compatible with Vercel)

We need to create a Vercel-compatible version without Socket.IO:

### Update server.js for Vercel:

Create `server-vercel.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const adminRoutes = require('./routes/adminRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const calendarRoutes = require('./routes/calendarRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/calendar', calendarRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
```

## Step 4: Update package.json

Add Vercel-specific scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "vercel-build": "echo 'Build complete'",
    "setup": "node scripts/setupUsers.js"
  }
}
```

## Step 5: Configure Environment Variables in Vercel

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/leave-management.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Import"

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables, add:
   
   ```
   DB_HOST=your-mysql-host.com
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=leave_management
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://your-app.vercel.app`

## Step 6: Test Deployment

1. Visit your Vercel URL
2. Try registering a new user
3. Login and test features
4. Submit leave requests
5. Login as manager and approve/reject

## Step 7: Set Up Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Troubleshooting

### Error: "Cannot connect to database"

**Solution:**
- Check environment variables in Vercel
- Ensure remote MySQL allows connections from Vercel IPs
- Test connection locally first

### Error: "Registration failed"

**Solution:**
- Check Vercel logs: `vercel logs`
- Verify database schema is imported
- Check environment variables

### Error: "CORS issues"

**Solution:**
Update `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Real-time notifications not working

**Expected:** Real-time features don't work on Vercel (serverless limitation)

**Workaround:**
- Add auto-refresh every 30 seconds
- Add manual refresh button
- Use polling instead of WebSockets

## Alternative: Deploy to Platforms That Support WebSockets

If you need real-time features, deploy to:

### Option 1: Railway (Recommended)
- Supports WebSockets
- Free tier available
- Easy deployment
- Built-in MySQL

**Steps:**
1. Go to https://railway.app
2. Create new project
3. Add MySQL service
4. Deploy from GitHub
5. Add environment variables
6. Done!

### Option 2: Render
- Supports WebSockets
- Free tier available
- Similar to Heroku

### Option 3: DigitalOcean App Platform
- Full support for Node.js apps
- Managed databases
- $5/month

### Option 4: Traditional VPS
- AWS EC2, DigitalOcean Droplet, Linode
- Full control
- Requires more setup

## Recommended Deployment Strategy

### For Production with Real-Time:
**Use Railway or Render** - They support WebSockets and are easy to deploy

### For Simple Deployment without Real-Time:
**Use Vercel** - Fastest deployment, but no WebSockets

### For Enterprise:
**Use AWS/Azure/GCP** - Full control, scalability, but complex setup

## Files Needed for Vercel Deployment

```
employee-leave-management/
├── vercel.json          ← Vercel configuration
├── server.js            ← Main server file
├── package.json         ← Dependencies
├── .env.example         ← Example environment variables
├── config/              ← Database config
├── controllers/         ← Business logic
├── middleware/          ← Auth middleware
├── routes/              ← API routes
├── public/              ← Frontend files
└── database/            ← SQL schema (for reference)
```

## Post-Deployment Checklist

- [ ] Database schema imported to remote MySQL
- [ ] Environment variables configured in Vercel
- [ ] Application deployed successfully
- [ ] Can access the URL
- [ ] Registration works
- [ ] Login works
- [ ] Can submit leave requests
- [ ] Manager can approve/reject
- [ ] All pages load correctly

## Cost Estimate

### Free Tier (Hobby Projects):
- Vercel: Free (with limits)
- PlanetScale MySQL: Free (5GB storage)
- Total: **$0/month**

### Production:
- Vercel Pro: $20/month
- PlanetScale Scaler: $29/month
- Total: **$49/month**

### Alternative (Railway):
- Railway: $5-10/month (includes MySQL)
- Total: **$5-10/month**

## Need Help?

1. Check Vercel logs: `vercel logs`
2. Check build logs in Vercel dashboard
3. Test locally first: `npm start`
4. Verify environment variables
5. Check database connection

## Summary

✅ **Vercel is great for:** Fast deployment, static sites, serverless APIs
❌ **Vercel is NOT good for:** Real-time features, WebSockets, persistent connections

**Recommendation:** Use Railway or Render for this project to keep real-time features working!
