-- ============================================
-- COPY THIS ENTIRE FILE AND PASTE INTO RAILWAY
-- ============================================
-- Go to Railway → MySQL service → Query tab
-- Paste this entire content and click Run
-- ============================================

USE railway;

-- Clean up any existing tables
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employee','manager','admin') DEFAULT 'employee',
    manager_id INT NULL,
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create leave_types table
CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_days INT NOT NULL,
    carry_over BOOLEAN DEFAULT FALSE
);

-- Create leave_balances table
CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year YEAR NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    used_days DECIMAL(4,1) DEFAULT 0,
    remaining_days DECIMAL(4,1) AS (total_days - used_days) STORED,
    UNIQUE(user_id, leave_type_id, year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
);

-- Create leave_requests table
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    reason TEXT,
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    reviewed_by INT NULL,
    review_comment TEXT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create holidays table
CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    date DATE UNIQUE NOT NULL
);

-- Insert leave types
INSERT INTO leave_types (name, default_days, carry_over) VALUES
('Annual Leave', 15, TRUE),
('Sick Leave', 10, FALSE),
('Casual Leave', 5, FALSE),
('Maternity/Paternity Leave', 90, FALSE);

-- Insert users (all passwords: Admin@123)
INSERT INTO users (employee_id, first_name, last_name, email, password_hash, role, manager_id, department) VALUES
('EMP001', 'Admin', 'User', 'admin@company.com', '$2a$10$n3XK4OYHG7ZcwTuJEHZ1/OS9vE0TVf6xd7AVQWZ7OJQvOGdvkegkW', 'admin', NULL, 'Management'),
('EMP002', 'John', 'Manager', 'manager@company.com', '$2a$10$kumsEw/NZSwlS51HKGKagej0NPXa9RCWo8.tlV6zA730mblNcy9eK', 'manager', NULL, 'Management'),
('EMP003', 'John', 'Doe', 'john.doe@company.com', '$2a$10$OrCbtxUzEu9d63yiLEifneFt2samxnlOP65RZHJYKlgoJWNfbfyYu', 'employee', 1, 'Engineering'),
('EMP004', 'Jane', 'Smith', 'jane.smith@company.com', '$2a$10$/Kw7lyUb8bajaDU.5VlhEOPXoFu1OKji3Qr2E4boLJAmEoBlrI/ym', 'employee', 1, 'Marketing'),
('EMP005', 'Bob', 'Wilson', 'bob.wilson@company.com', '$2a$10$6j6CTEotT2uXfAPfRMvLhe2d6t2BoTahAxVhoqoem.bQwwXO2YC7i', 'employee', 1, 'Sales');

-- Insert leave balances for 2026
INSERT INTO leave_balances (user_id, leave_type_id, year, total_days, used_days) VALUES
(1, 1, 2026, 15, 0), (1, 2, 2026, 10, 0), (1, 3, 2026, 5, 0), (1, 4, 2026, 90, 0),
(2, 1, 2026, 15, 0), (2, 2, 2026, 10, 0), (2, 3, 2026, 5, 0), (2, 4, 2026, 90, 0),
(3, 1, 2026, 15, 0), (3, 2, 2026, 10, 0), (3, 3, 2026, 5, 0), (3, 4, 2026, 90, 0),
(4, 1, 2026, 15, 0), (4, 2, 2026, 10, 0), (4, 3, 2026, 5, 0), (4, 4, 2026, 90, 0),
(5, 1, 2026, 15, 0), (5, 2, 2026, 10, 0), (5, 3, 2026, 5, 0), (5, 4, 2026, 90, 0);

-- Insert holidays
INSERT INTO holidays (name, date) VALUES
('New Year\'s Day', '2026-01-01'),
('Republic Day', '2026-01-26'),
('Independence Day', '2026-08-15'),
('Gandhi Jayanti', '2026-10-02'),
('Diwali', '2026-11-01'),
('Christmas', '2026-12-25');

-- Verify the import
SELECT 'Users created' as Info, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Leave types created', COUNT(*) FROM leave_types
UNION ALL
SELECT 'Leave balances created', COUNT(*) FROM leave_balances
UNION ALL
SELECT 'Holidays created', COUNT(*) FROM holidays;

-- ============================================
-- AFTER RUNNING THIS:
-- You should see output showing:
-- - Users created: 5
-- - Leave types created: 4
-- - Leave balances created: 20
-- - Holidays created: 6
-- ============================================
