// Tab switching
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active form
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${targetTab}Form`).classList.add('active');
    
    // Clear errors
    document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    document.querySelectorAll('.form-control').forEach(c => c.classList.remove('error'));
  });
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-control').forEach(c => c.classList.remove('error'));
  
  // Validate
  let hasError = false;
  
  if (!email || !email.includes('@')) {
    document.getElementById('loginEmailError').textContent = 'Valid email is required';
    document.getElementById('loginEmail').classList.add('error');
    hasError = true;
  }
  
  if (!password) {
    document.getElementById('loginPasswordError').textContent = 'Password is required';
    document.getElementById('loginPassword').classList.add('error');
    hasError = true;
  }
  
  if (hasError) return;
  
  try {
    showLoading();
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    hideLoading();
    
    if (!response.ok) {
      showToast(data.error || 'Login failed', 'error');
      return;
    }
    
    // Store token
    setToken(data.token);
    
    // Redirect based on role
    if (data.user.role === 'manager' || data.user.role === 'admin') {
      window.location.href = '/manager-dashboard.html';
    } else {
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    hideLoading();
    showToast('Login failed. Please try again.', 'error');
    console.error('Login error:', error);
  }
});

// Register Form Handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const department = document.getElementById('department').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(e => e.textContent = '');
  document.querySelectorAll('.form-control').forEach(c => c.classList.remove('error'));
  
  // Validate
  let hasError = false;
  
  if (!firstName) {
    document.getElementById('firstNameError').textContent = 'First name is required';
    document.getElementById('firstName').classList.add('error');
    hasError = true;
  }
  
  if (!lastName) {
    document.getElementById('lastNameError').textContent = 'Last name is required';
    document.getElementById('lastName').classList.add('error');
    hasError = true;
  }
  
  if (!email || !email.includes('@')) {
    document.getElementById('registerEmailError').textContent = 'Valid email is required';
    document.getElementById('registerEmail').classList.add('error');
    hasError = true;
  }
  
  if (!department) {
    document.getElementById('departmentError').textContent = 'Department is required';
    document.getElementById('department').classList.add('error');
    hasError = true;
  }
  
  // Password validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#]).{8,}$/;
  if (!password || password.length < 8) {
    document.getElementById('registerPasswordError').textContent = 'Password must be at least 8 characters';
    document.getElementById('registerPassword').classList.add('error');
    hasError = true;
  } else if (!passwordRegex.test(password)) {
    document.getElementById('registerPasswordError').textContent = 'Password must contain uppercase, number, and special character';
    document.getElementById('registerPassword').classList.add('error');
    hasError = true;
  }
  
  if (password !== confirmPassword) {
    document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
    document.getElementById('confirmPassword').classList.add('error');
    hasError = true;
  }
  
  if (hasError) return;
  
  try {
    showLoading();
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password, department })
    });
    
    const data = await response.json();
    hideLoading();
    
    if (!response.ok) {
      showToast(data.error || 'Registration failed', 'error');
      return;
    }
    
    showToast(`Registration successful! Your Employee ID: ${data.employeeId}`, 'success');
    
    // Switch to login tab after 2 seconds
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
      document.getElementById('loginEmail').value = email;
    }, 2000);
  } catch (error) {
    hideLoading();
    showToast('Registration failed. Please try again.', 'error');
    console.error('Register error:', error);
  }
});
