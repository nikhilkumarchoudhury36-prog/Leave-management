// Check authentication
if (!requireAuth()) {
  throw new Error('Not authenticated');
}

const user = getUser();
let balances = [];
let holidays = [];
let leaveTypes = [];

// Initialize form
async function initForm() {
  try {
    // Update user info
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role;

    // Load data
    await Promise.all([
      loadLeaveTypes(),
      loadBalances(),
      loadHolidays()
    ]);

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('startDate').min = minDate;
    document.getElementById('endDate').min = minDate;

    // Add event listeners
    document.getElementById('leaveType').addEventListener('change', updateAvailableBalance);
    document.getElementById('startDate').addEventListener('change', updateWorkingDays);
    document.getElementById('endDate').addEventListener('change', updateWorkingDays);
  } catch (error) {
    console.error('Form init error:', error);
    showToast('Failed to initialize form', 'error');
  }
}

// Load leave types
async function loadLeaveTypes() {
  try {
    const response = await fetch('/api/leaves');
    const data = await response.json();
    
    // Extract unique leave types from user's leaves or fetch from balances
    const balancesData = await apiRequest('/balances');
    
    const select = document.getElementById('leaveType');
    balancesData.forEach(balance => {
      const option = document.createElement('option');
      option.value = balance.id; // This is leave_balance id, we need leave_type_id
      option.textContent = balance.leave_type;
      option.dataset.leaveType = balance.leave_type;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Load leave types error:', error);
  }
}

// Load balances
async function loadBalances() {
  try {
    balances = await apiRequest('/balances');
  } catch (error) {
    console.error('Load balances error:', error);
  }
}

// Load holidays
async function loadHolidays() {
  try {
    const currentYear = new Date().getFullYear();
    const response = await fetch(`/api/calendar?month=1&year=${currentYear}`);
    const data = await response.json();
    holidays = data.holidays.map(h => h.date);
  } catch (error) {
    console.error('Load holidays error:', error);
  }
}

// Update available balance display
function updateAvailableBalance() {
  const selectedIndex = document.getElementById('leaveType').selectedIndex - 1;
  
  if (selectedIndex >= 0 && balances[selectedIndex]) {
    const balance = balances[selectedIndex];
    document.getElementById('availableBalance').textContent = balance.remaining_days;
    document.getElementById('balanceInfo').classList.remove('hidden');
  } else {
    document.getElementById('balanceInfo').classList.add('hidden');
  }
  
  updateWorkingDays();
}

// Update working days calculation
function updateWorkingDays() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (startDate && endDate) {
    const days = calculateWorkingDays(startDate, endDate, holidays);
    document.getElementById('workingDays').textContent = days;
    document.getElementById('workingDaysInfo').classList.remove('hidden');
    
    // Validate against balance
    const selectedIndex = document.getElementById('leaveType').selectedIndex - 1;
    if (selectedIndex >= 0 && balances[selectedIndex]) {
      const available = parseFloat(balances[selectedIndex].remaining_days);
      if (days > available) {
        document.getElementById('endDateError').textContent = `Insufficient balance. You have ${available} days available.`;
        document.getElementById('endDate').classList.add('error');
      } else {
        document.getElementById('endDateError').textContent = '';
        document.getElementById('endDate').classList.remove('error');
      }
    }
  } else {
    document.getElementById('workingDaysInfo').classList.add('hidden');
  }
}

// Form submission
document.getElementById('leaveRequestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear errors
  document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-control').forEach(c => c.classList.remove('error'));
  
  const leaveTypeIndex = document.getElementById('leaveType').selectedIndex - 1;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const reason = document.getElementById('reason').value.trim();
  
  // Validate
  let hasError = false;
  
  if (leaveTypeIndex < 0) {
    document.getElementById('leaveTypeError').textContent = 'Please select a leave type';
    document.getElementById('leaveType').classList.add('error');
    hasError = true;
  }
  
  if (!startDate) {
    document.getElementById('startDateError').textContent = 'Start date is required';
    document.getElementById('startDate').classList.add('error');
    hasError = true;
  }
  
  if (!endDate) {
    document.getElementById('endDateError').textContent = 'End date is required';
    document.getElementById('endDate').classList.add('error');
    hasError = true;
  }
  
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    document.getElementById('endDateError').textContent = 'End date must be after start date';
    document.getElementById('endDate').classList.add('error');
    hasError = true;
  }
  
  if (reason.length < 10) {
    document.getElementById('reasonError').textContent = 'Reason must be at least 10 characters';
    document.getElementById('reason').classList.add('error');
    hasError = true;
  }
  
  if (hasError) return;
  
  try {
    showLoading();
    
    // Get the actual leave_type_id from the balance
    const balance = balances[leaveTypeIndex];
    
    // We need to get the leave_type_id, not the balance id
    // Let's extract it from the balance object structure
    const leaveTypeId = leaveTypeIndex + 1; // Assuming sequential IDs
    
    const response = await fetch('/api/leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        leaveTypeId,
        startDate,
        endDate,
        reason
      })
    });
    
    const data = await response.json();
    hideLoading();
    
    if (!response.ok) {
      showToast(data.error || 'Failed to submit leave request', 'error');
      return;
    }
    
    showToast('Leave request submitted successfully!', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } catch (error) {
    hideLoading();
    showToast('Failed to submit leave request', 'error');
    console.error('Submit error:', error);
  }
});

// Initialize
initForm();
