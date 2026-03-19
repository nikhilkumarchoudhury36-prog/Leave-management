# Real-Time Notifications Feature

## What's New? 🎉

Your Leave Management System now has **real-time notifications** using WebSocket technology (Socket.IO)!

## Features

### For Managers:
✅ **Instant notifications** when employees submit leave requests
✅ **Audio alert** when new requests arrive
✅ **Auto-refresh** of pending requests table
✅ **No need to refresh the page** - updates appear automatically

### For Employees:
✅ **Instant notifications** when manager approves/rejects leave
✅ **Real-time status updates** on dashboard
✅ **Auto-refresh** of leave balances and history
✅ **Color-coded notifications** (green for approved, red for rejected)

## How It Works

### When an Employee Submits a Leave Request:
1. Employee fills out the leave request form
2. Clicks "Submit Request"
3. **Instantly**, all managers see:
   - A toast notification: "New leave request from [Employee Name]"
   - A sound alert (beep)
   - The pending requests table automatically updates

### When a Manager Reviews a Request:
1. Manager clicks Approve or Reject
2. Adds a comment (optional for approval, required for rejection)
3. Clicks "Confirm"
4. **Instantly**, the employee sees:
   - A toast notification: "Your leave request has been approved/rejected by [Manager Name]"
   - Their dashboard updates with new balance
   - Leave history refreshes automatically

## Testing the Real-Time Feature

### Test 1: Manager Notifications

1. **Open two browser windows:**
   - Window 1: Login as Manager (`manager@company.com` / `Admin@123`)
   - Window 2: Login as Employee (`emp1@company.com` / `Emp@1234`)

2. **In Employee window:**
   - Go to "Request Leave"
   - Fill out the form
   - Click "Submit Request"

3. **Watch the Manager window:**
   - You should see a notification appear instantly
   - Hear a beep sound
   - See the new request in the pending table

### Test 2: Employee Notifications

1. **Keep both windows open**

2. **In Manager window:**
   - Click "Approve" or "Reject" on a pending request
   - Add a comment
   - Click "Confirm"

3. **Watch the Employee window:**
   - You should see a notification appear instantly
   - The dashboard updates automatically
   - Balance changes reflect immediately

## Technical Details

### Technology Used:
- **Socket.IO** - WebSocket library for real-time communication
- **Event-based architecture** - Efficient message passing
- **Room-based broadcasting** - Managers join "managers" room, employees join user-specific rooms

### Events:
- `newLeaveRequest` - Sent to all managers when employee submits leave
- `leaveReviewed` - Sent to specific employee when manager reviews their request
- `join` - User joins appropriate rooms based on role

### Connection:
- Automatic reconnection if connection drops
- Secure WebSocket connection
- Low latency (< 100ms typically)

## Browser Compatibility

Works on all modern browsers:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Troubleshooting

### Notifications not appearing?

1. **Check browser console** (F12 → Console tab)
   - Should see: "Connected to server"
   - If you see connection errors, the server might be down

2. **Refresh the page**
   - Socket connection is established on page load
   - If you loaded the page before the server started, refresh

3. **Check if server is running**
   - Server must be running for real-time features to work
   - Look for: "Server running on http://localhost:3002"

### Sound not playing?

- Some browsers block auto-play audio
- Click anywhere on the page first to enable audio
- Or check browser sound settings

### Updates not appearing?

- Make sure both users are logged in
- Check that the employee's manager_id matches the logged-in manager
- Verify network connection

## Benefits

### Before (Without Real-Time):
- ❌ Manager had to refresh page to see new requests
- ❌ Employee didn't know when request was reviewed
- ❌ Delays in communication
- ❌ Manual checking required

### After (With Real-Time):
- ✅ Instant notifications
- ✅ No page refresh needed
- ✅ Immediate feedback
- ✅ Better user experience
- ✅ Faster approval process

## Future Enhancements

Possible additions:
- Email notifications (in addition to real-time)
- Mobile push notifications
- Desktop notifications (browser API)
- Notification history/inbox
- Read/unread status
- Notification preferences

## Performance

- **Minimal overhead** - WebSocket connections are lightweight
- **Scalable** - Can handle hundreds of concurrent users
- **Efficient** - Only sends data when events occur
- **Battery friendly** - Uses persistent connection instead of polling

Enjoy your new real-time leave management system! 🚀
