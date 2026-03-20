// Check authentication
if (!requireAuth()) {
  throw new Error('Not authenticated');
}

const user = getUser();

// Initialize balance page
async function initBalancePage() {
  try {
    // Update user info
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userRole').className = `role-badge ${user.role}`;

    // Populate navigation based on role
    populateNavigation();

    // Load balances
    await loadBalances();
  } catch (error) {
    console.error('Balance page init error:', error);
    showToast('Failed to load balance data', 'error');
  }
}

// Populate navigation based on user role
function populateNavigation() {
  const sidebarNav = document.getElementById('sidebarNav');
  
  if (user.role === 'manager' || user.role === 'admin') {
    sidebarNav.innerHTML = `
      <li><a href="/manager-dashboard.html">Dashboard</a></li>
      <li><a href="/calendar.html">Calendar</a></li>
      <li><a href="/dashboard.html">My Leaves</a></li>
      <li><a href="/balance.html" class="active">My Balances</a></li>
    `;
  } else {
    sidebarNav.innerHTML = `
      <li><a href="/dashboard.html">Dashboard</a></li>
      <li><a href="/leave-request.html">Request Leave</a></li>
      <li><a href="/balance.html" class="active">My Balances</a></li>
      <li><a href="/calendar.html">Calendar</a></li>
    `;
  }
}

// Load and render balances
async function loadBalances() {
  try {
    const balances = await apiRequest('/balances');
    
    // Calculate total remaining
    const totalRemaining = balances.reduce((sum, b) => sum + parseFloat(b.remaining_days), 0);
    document.getElementById('totalRemaining').textContent = totalRemaining.toFixed(1);

    // Render balance table
    const tbody = document.getElementById('balanceTable');
    tbody.innerHTML = '';

    if (balances.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No balance data found</td></tr>';
      return;
    }

    balances.forEach(balance => {
      const usedPercent = (balance.used_days / balance.total_days) * 100;
      let progressClass = '';
      
      if (usedPercent >= 80) {
        progressClass = 'danger';
      } else if (usedPercent >= 60) {
        progressClass = 'warning';
      }
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${balance.leave_type}</strong></td>
        <td>${balance.total_days}</td>
        <td>${balance.used_days}</td>
        <td>${balance.remaining_days}</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar ${progressClass}" style="width: ${usedPercent}%">
              ${usedPercent.toFixed(0)}%
            </div>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Load balances error:', error);
  }
}

// Initialize
initBalancePage();
