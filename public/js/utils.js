// API Configuration
const API_BASE = '/api';

// Token Management
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
  window.location.href = '/index.html';
}

// Decode JWT to get user info
function getUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

// API Request Wrapper
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    // Handle 401 - auto logout
    if (response.status === 401) {
      showToast('Session expired. Please login again.', 'error');
      removeToken();
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Date Formatting
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

// Auth Guards
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

function requireRole(role) {
  const user = getUser();
  if (!user || user.role !== role) {
    showToast('Access denied', 'error');
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

// Calculate working days excluding weekends and holidays
function calculateWorkingDays(startDate, endDate, holidays = []) {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  const holidaySet = new Set(holidays.map(h => h.split('T')[0]));

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    
    // Exclude weekends (0 = Sunday, 6 = Saturday) and holidays
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

// Show/Hide Loading Overlay
function showLoading() {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}
