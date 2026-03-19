# Testing Real-Time Notifications

## Current Status
✅ Server running on http://localhost:3002
✅ Socket.IO installed and configured
✅ Manager dashboard fixed
✅ Real-time events configured

## Step-by-Step Test

### Setup (Do this first):

1. **Open TWO browser windows side by side**
   - Window 1: Manager
   - Window 2: Employee

2. **Window 1 - Login as Manager:**
   - Go to: http://localhost:3002
   - Email: `manager@company.com`
   - Password: `Admin@123`
   - You should see the Manager Dashboard

3. **Window 2 - Login as Employee:**
   - Go to: http://localhost:3002 (new window/tab)
   - Email: `emp1@company.com`
   - Password: `Emp@1234`
   - You should see the Employee Dashboard

### Test 1: Real-Time Leave Request Notification

**In Employee Window (Window 2):**
1. Click "Request Leave" in the sidebar
2. Fill out the form:
   - Leave Type: Select "Vacation"
   - Start Date: Pick tomorrow's date
   - End Date: Pick a date 2-3 days after start
   - Reason: "Testing real-time notifications"
3. Click "Submit Request"
4. You should see: "Leave request submitted successfully"

**Watch Manager Window (Window 1):**
- ✅ You should see a green notification popup: "New leave request from Alice Smith"
- ✅ You should hear a beep sound
- ✅ The "Pending Approvals" table should update automatically
- ✅ The "Pending Count" stat should increase

**If it doesn't work:**
- Open browser console (F12) in Manager window
- Look for: "Connected to server" and "Manager 1 joined managers room"
- If you see errors, share them

### Test 2: Real-Time Approval Notification

**In Manager Window (Window 1):**
1. Find the leave request you just submitted
2. Click the green "✓ Approve" button
3. Add a comment (optional): "Approved for testing"
4. Click "Confirm"
5. You should see: "Leave request approved successfully"

**Watch Employee Window (Window 2):**
- ✅ You should see a green notification: "Your leave request has been approved by John Manager"
- ✅ The dashboard should refresh automatically
- ✅ Leave balance should update
- ✅ Recent leaves table should show the approved request

**If it doesn't work:**
- Open browser console (F12) in Employee window
- Look for: "Connected to server"
- Check for any errors

### Test 3: Real-Time Rejection Notification

**Repeat Test 1** to create another leave request

**In Manager Window:**
1. Click the red "✗ Reject" button
2. Add a comment (required): "Testing rejection notification"
3. Click "Confirm"

**Watch Employee Window:**
- ✅ You should see a red notification: "Your leave request has been rejected by John Manager"
- ✅ Dashboard updates automatically

## Troubleshooting

### Problem: No notifications appearing

**Check 1: Browser Console**
- Press F12 in both windows
- Go to Console tab
- Look for Socket.IO connection messages
- Should see: "Connected to server"

**Check 2: Network Tab**
- Press F12 → Network tab
- Look for "socket.io" connections
- Should show "101 Switching Protocols" (WebSocket upgrade)

**Check 3: Server Logs**
Run this in PowerShell:
```powershell
# Check if server is running
Get-Process node
```

### Problem: Manager dashboard not loading

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Try incognito/private window
4. Check browser console for errors

### Problem: Socket keeps disconnecting

**Possible causes:**
- Firewall blocking WebSocket connections
- Antivirus software interfering
- Browser extensions blocking connections

**Solution:**
- Temporarily disable firewall/antivirus
- Try a different browser
- Disable browser extensions

### Problem: No sound notification

**Solution:**
- Click anywhere on the page first (browsers block auto-play)
- Check browser sound settings
- Check system volume

## Debugging Commands

**Check server status:**
```powershell
Get-Process node
```

**View server logs:**
The server console shows all Socket.IO connections:
- "New client connected: [socket-id]"
- "Manager [id] joined managers room"
- "Client disconnected: [socket-id]"

**Test database connection:**
```powershell
node test-connection.js
```

## Expected Behavior

### When Employee Submits Leave:
1. POST request to `/api/leaves`
2. Server emits `newLeaveRequest` event to "managers" room
3. All connected managers receive notification
4. Manager dashboard updates automatically

### When Manager Reviews Leave:
1. PUT request to `/api/admin/review/:id`
2. Server emits `leaveReviewed` event to specific employee
3. Employee receives notification
4. Employee dashboard updates automatically

## Success Criteria

✅ Manager sees new requests instantly (no refresh needed)
✅ Employee sees approval/rejection instantly
✅ Notifications appear as toast messages
✅ Sound plays for manager notifications
✅ Dashboards update automatically
✅ No page refresh required

## Still Not Working?

1. **Restart the server:**
   ```powershell
   # Stop server (Ctrl+C in server terminal)
   npm start
   ```

2. **Clear browser data:**
   - Ctrl+Shift+Delete
   - Clear cache and cookies
   - Restart browser

3. **Check firewall:**
   - Windows Firewall might be blocking WebSocket
   - Add exception for Node.js

4. **Try different port:**
   - Edit `.env` file
   - Change `PORT=3002` to `PORT=3003`
   - Restart server
   - Access http://localhost:3003

## Additional Notes

- Real-time features require both users to be logged in simultaneously
- WebSocket connection is established when page loads
- If you loaded the page before server started, refresh the page
- Connection is maintained as long as page is open
- Closing the tab disconnects the socket

## Report Issues

If real-time still doesn't work, check:
1. Browser console errors (F12 → Console)
2. Network tab for WebSocket connections (F12 → Network)
3. Server logs for connection messages

Share any error messages you see!
