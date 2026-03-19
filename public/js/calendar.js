// Check authentication
if (!requireAuth()) {
  throw new Error('Not authenticated');
}

const user = getUser();
let currentMonth = new Date().getMonth() + 1;
let currentYear = new Date().getFullYear();

// Initialize calendar
async function initCalendar() {
  try {
    // Update user info
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userRole').textContent = user.role;
    document.getElementById('userRole').className = `role-badge ${user.role}`;

    // Populate month/year selectors
    populateSelectors();

    // Load calendar
    await loadCalendar();
  } catch (error) {
    console.error('Calendar init error:', error);
    showToast('Failed to load calendar', 'error');
  }
}

// Populate month and year selectors
function populateSelectors() {
  const monthSelect = document.getElementById('monthSelect');
  const yearSelect = document.getElementById('yearSelect');
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index + 1;
    option.textContent = month;
    if (index + 1 === currentMonth) option.selected = true;
    monthSelect.appendChild(option);
  });
  
  for (let year = currentYear - 1; year <= currentYear + 2; year++) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
  
  monthSelect.addEventListener('change', (e) => {
    currentMonth = parseInt(e.target.value);
    loadCalendar();
  });
  
  yearSelect.addEventListener('change', (e) => {
    currentYear = parseInt(e.target.value);
    loadCalendar();
  });
}

// Navigate to previous month
function prevMonth() {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  document.getElementById('monthSelect').value = currentMonth;
  document.getElementById('yearSelect').value = currentYear;
  loadCalendar();
}

// Navigate to next month
function nextMonth() {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  document.getElementById('monthSelect').value = currentMonth;
  document.getElementById('yearSelect').value = currentYear;
  loadCalendar();
}

// Load calendar data
async function loadCalendar() {
  try {
    showLoading();
    const data = await apiRequest(`/calendar?month=${currentMonth}&year=${currentYear}`);
    hideLoading();
    
    renderCalendar(data.leaves, data.holidays);
  } catch (error) {
    hideLoading();
    console.error('Load calendar error:', error);
    showToast('Failed to load calendar', 'error');
  }
}

// Render calendar grid
function renderCalendar(leaves, holidays) {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  
  // Add day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = day;
    grid.appendChild(header);
  });
  
  // Get first and last day of month
  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Create holiday map
  const holidayMap = {};
  holidays.forEach(h => {
    const date = new Date(h.date).toISOString().split('T')[0];
    holidayMap[date] = h.name;
  });
  
  // Create leave map (date -> array of leaves)
  const leaveMap = {};
  leaves.forEach(leave => {
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    const current = new Date(start);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (!leaveMap[dateStr]) leaveMap[dateStr] = [];
      leaveMap[dateStr].push(leave);
      current.setDate(current.getDate() + 1);
    }
  });
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startDayOfWeek; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day other-month';
    grid.appendChild(cell);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.className = 'calendar-day';
    
    if (holidayMap[dateStr]) {
      cell.classList.add('holiday');
    }
    
    let content = `<div class="day-number">${day}</div>`;
    
    // Add holiday name
    if (holidayMap[dateStr]) {
      content += `<div class="holiday-name">${holidayMap[dateStr]}</div>`;
    }
    
    // Add leave bars
    if (leaveMap[dateStr]) {
      leaveMap[dateStr].forEach(leave => {
        const leaveTypeClass = leave.leave_type.toLowerCase().includes('vacation') ? 'vacation' :
                               leave.leave_type.toLowerCase().includes('sick') ? 'sick' : 'personal';
        content += `<div class="leave-bar ${leaveTypeClass}" onclick="showLeaveDetails(${leave.id})" title="${leave.first_name} ${leave.last_name} - ${leave.leave_type}">
          ${leave.first_name}
        </div>`;
      });
    }
    
    cell.innerHTML = content;
    grid.appendChild(cell);
  }
}

// Show leave details
async function showLeaveDetails(leaveId) {
  try {
    const leave = await apiRequest(`/leaves/${leaveId}`);
    
    const detailsHtml = `
      <p><strong>Employee:</strong> ${leave.first_name} ${leave.last_name}</p>
      <p><strong>Department:</strong> ${leave.department}</p>
      <p><strong>Leave Type:</strong> ${leave.leave_type}</p>
      <p><strong>Period:</strong> ${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}</p>
      <p><strong>Total Days:</strong> ${leave.total_days}</p>
      <p><strong>Reason:</strong> ${leave.reason}</p>
      <p><strong>Status:</strong> <span class="status-badge ${leave.status}">${leave.status}</span></p>
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

// Initialize
initCalendar();
