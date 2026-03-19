// Check authentication
if (!requireAuth()) {
  throw new Error('Not authenticated');
}

const user = getUser();

// Initialize dashboard
async function initDashboard() {
  try {
    // Update user info in header
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userRole').className = `role-badge ${user.role}`;

    // Load data
    await Promise.all([
      loadBalances(),
      loadRecentLeaves()
    ]);
  } catch (error) {
    console.error('Dashboard init error:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

// Load leave balances
async function loadBalances() {
  try {
    const balances = await apiRequest('/balances');
    
    // Calculate total remaining
    const totalRemaining = balances.reduce((sum, b) => sum + parseFloat(b.remaining_days), 0);
    document.getElementById('totalRemaining').textContent = totalRemaining.toFixed(1);

    // Render balance charts
    const chartsContainer = document.getElementById('balanceCharts');
    chartsContainer.innerHTML = '';

    balances.forEach(balance => {
      const usedPercent = (balance.used_days / balance.total_days) * 100;
      
      const item = document.createElement('div');
      item.className = 'balance-item';
      item.innerHTML = `
        <div class="balance-header">
          <span class="balance-label">${balance.leave_type}</span>
          <span class="balance-values">${balance.used_days} / ${balance.total_days} days used</span>
        </div>
        <div class="balance-bar">
          <div class="balance-bar-fill" style="width: ${usedPercent}%">
            ${balance.remaining_days} left
          </div>
        </div>
      `;
      chartsContainer.appendChild(item);
    });
  } catch (error) {
    console.error('Load balances error:', error);
  }
}

// Load recent leave requests
async function loadRecentLeaves() {
  try {
    const currentYear = new Date().getFullYear();
    const leaves = await apiRequest(`/leaves?year=${currentYear}`);
    
    // Update stats
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;

    // Find next upcoming leave
    const today = new Date();
    const upcoming = leaves
      .filter(l => l.status === 'approved' && new Date(l.start_date) > today)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    if (upcoming.length > 0) {
      document.getElementById('nextLeave').textContent = formatDate(upcoming[0].start_date);
    }

    // Render recent leaves table (last 5)
    const tbody = document.getElementById('recentLeaves');
    tbody.innerHTML = '';

    if (leaves.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">No leave requests found</td></tr>';
      return;
    }

    leaves.slice(0, 5).forEach(leave => {
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';
      row.onclick = () => showLeaveDetails(leave.id);
      row.innerHTML = `
        <td>${leave.leave_type}</td>
        <td>${formatDate(leave.start_date)}</td>
        <td>${formatDate(leave.end_date)}</td>
        <td>${leave.total_days}</td>
        <td><span class="status-badge ${leave.status}">${leave.status}</span></td>
        <td>${formatDate(leave.created_at)}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load leaves error:', error);
  }
}

// Show leave details in modal
async function showLeaveDetails(leaveId) {
  try {
    const leave = await apiRequest(`/leaves/${leaveId}`);
    
    const detailsHtml = `
      <p><strong>Employee:</strong> ${leave.first_name} ${leave.last_name} (${leave.employee_id})</p>
      <p><strong>Department:</strong> ${leave.department}</p>
      <p><strong>Leave Type:</strong> ${leave.leave_type}</p>
      <p><strong>Start Date:</strong> ${formatDate(leave.start_date)}</p>
      <p><strong>End Date:</strong> ${formatDate(leave.end_date)}</p>
      <p><strong>Total Days:</strong> ${leave.total_days}</p>
      <p><strong>Reason:</strong> ${leave.reason}</p>
      <p><strong>Status:</strong> <span class="status-badge ${leave.status}">${leave.status}</span></p>
      ${leave.reviewed_at ? `
        <p><strong>Reviewed By:</strong> ${leave.reviewer_first_name} ${leave.reviewer_last_name}</p>
        <p><strong>Reviewed At:</strong> ${formatDate(leave.reviewed_at)}</p>
        ${leave.review_comment ? `<p><strong>Comment:</strong> ${leave.review_comment}</p>` : ''}
      ` : ''}
    `;
    
    document.getElementById('leaveDetails').innerHTML = detailsHtml;
    document.getElementById('leaveModal').classList.add('active');
  } catch (error) {
    console.error('Load leave details error:', error);
    showToast('Failed to load leave details', 'error');
  }
}

function closeModal() {
  document.getElementById('leaveModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('leaveModal').addEventListener('click', (e) => {
  if (e.target.id === 'leaveModal') {
    closeModal();
  }
});

// Initialize on page load
initDashboard();
