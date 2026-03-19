// Check authentication and role
if (!requireAuth()) {
  throw new Error('Not authenticated');
}

const user = getUser();
if (user.role !== 'manager' && user.role !== 'admin') {
  showToast('Access denied', 'error');
  window.location.href = '/dashboard.html';
}

let currentReviewId = null;
let socket = null;

// Initialize Socket.IO connection
function initSocket() {
  socket = io();
  
  socket.on('connect', () => {
    console.log('Connected to server');
    // Join managers room
    socket.emit('join', { userId: user.id, role: user.role });
  });
  
  // Listen for new leave requests
  socket.on('newLeaveRequest', (data) => {
    console.log('New leave request received:', data);
    showToast(`New leave request from ${data.employeeName}`, 'success');
    
    // Play notification sound (optional)
    playNotificationSound();
    
    // Reload pending requests
    loadPendingRequests();
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

// Play notification sound
function playNotificationSound() {
  // Create a simple beep sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Initialize manager dashboard
async function initManagerDashboard() {
  try {
    // Update user info
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userRole').className = `role-badge ${user.role}`;

    // Initialize Socket.IO
    initSocket();

    // Load data
    await Promise.all([
      loadPendingRequests(),
      loadTeamOverview()
    ]);
  } catch (error) {
    console.error('Manager dashboard init error:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

// Load pending requests
async function loadPendingRequests() {
  try {
    const requests = await apiRequest('/admin/pending');
    
    // Update stats
    document.getElementById('pendingCount').textContent = requests.length;
    
    // For approved/rejected today, we'll just show 0 for now
    // (would need a separate API endpoint to get this efficiently)
    document.getElementById('approvedToday').textContent = '0';
    document.getElementById('rejectedToday').textContent = '0';

    // Render pending requests table
    const tbody = document.getElementById('pendingRequests');
    tbody.innerHTML = '';

    if (requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center">No pending requests</td></tr>';
      return;
    }

    requests.forEach(request => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.first_name} ${request.last_name}</td>
        <td>${request.department}</td>
        <td>${request.leave_type}</td>
        <td>${formatDate(request.start_date)}</td>
        <td>${formatDate(request.end_date)}</td>
        <td>${request.total_days}</td>
        <td>${formatDate(request.created_at)}</td>
        <td class="action-buttons">
          <button class="btn btn-success btn-sm" onclick="openReviewModal(${request.id}, 'approved', '${request.first_name} ${request.last_name}', '${request.leave_type}', '${request.start_date}', '${request.end_date}', ${request.total_days})">✓ Approve</button>
          <button class="btn btn-danger btn-sm" onclick="openReviewModal(${request.id}, 'rejected', '${request.first_name} ${request.last_name}', '${request.leave_type}', '${request.start_date}', '${request.end_date}', ${request.total_days})">✗ Reject</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load pending requests error:', error);
    showToast('Failed to load pending requests', 'error');
  }
}

// Load team overview
async function loadTeamOverview() {
  try {
    const team = await apiRequest('/admin/team');
    
    // Update team size
    document.getElementById('teamSize').textContent = team.length;

    // Render team table
    const tbody = document.getElementById('teamOverview');
    tbody.innerHTML = '';

    if (team.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No team members found</td></tr>';
      return;
    }

    team.forEach(member => {
      const row = document.createElement('tr');
      
      // Format balances
      const balanceText = member.balances.map(b => 
        `${b.leaveType}: ${b.remaining}/${b.total}`
      ).join(', ');
      
      row.innerHTML = `
        <td>${member.firstName} ${member.lastName}</td>
        <td>${member.employeeId}</td>
        <td>${member.department}</td>
        <td>${member.email}</td>
        <td style="font-size: 0.75rem;">${balanceText || 'No balances'}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load team overview error:', error);
  }
}

// Open review modal
function openReviewModal(id, action, employeeName, leaveType, startDate, endDate, totalDays) {
  currentReviewId = id;
  
  document.getElementById('reviewAction').textContent = action === 'approved' ? 'Approve' : 'Reject';
  document.getElementById('reviewSummary').innerHTML = `
    <p><strong>Employee:</strong> ${employeeName}</p>
    <p><strong>Leave Type:</strong> ${leaveType}</p>
    <p><strong>Period:</strong> ${formatDate(startDate)} to ${formatDate(endDate)}</p>
    <p><strong>Total Days:</strong> ${totalDays}</p>
  `;
  
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewCommentError').textContent = '';
  
  // Set button colors
  const confirmBtn = document.getElementById('confirmReview');
  confirmBtn.className = action === 'approved' ? 'btn btn-success' : 'btn btn-danger';
  confirmBtn.onclick = () => submitReview(action);
  
  document.getElementById('reviewModal').classList.add('active');
}

// Submit review
async function submitReview(action) {
  const comment = document.getElementById('reviewComment').value.trim();
  
  // Validate: comment required for rejection
  if (action === 'rejected' && !comment) {
    document.getElementById('reviewCommentError').textContent = 'Comment is required for rejection';
    return;
  }
  
  try {
    showLoading();
    await apiRequest(`/admin/review/${currentReviewId}`, 'PUT', { action, comment });
    hideLoading();
    
    showToast(`Leave request ${action} successfully`, 'success');
    closeReviewModal();
    
    // Reload data
    await loadPendingRequests();
  } catch (error) {
    hideLoading();
    showToast(`Failed to ${action} leave request`, 'error');
    console.error('Review error:', error);
  }
}

// Close review modal
function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
  currentReviewId = null;
}

// Close modal on overlay click
document.getElementById('reviewModal').addEventListener('click', (e) => {
  if (e.target.id === 'reviewModal') {
    closeReviewModal();
  }
});

// Initialize
initManagerDashboard();
