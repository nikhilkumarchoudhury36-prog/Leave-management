-- Create database
CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

-- Table: users
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

-- Table: leave_types
CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    default_days INT NOT NULL,
    carry_over BOOLEAN DEFAULT FALSE
);

-- Table: leave_balances
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

-- Table: leave_requests
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

-- Table: holidays
CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    date DATE UNIQUE NOT NULL
);

-- Seed data: leave_types
INSERT INTO leave_types (name, default_days, carry_over) VALUES
('Vacation', 15, TRUE),
('Sick Leave', 10, FALSE),
('Personal Leave', 5, FALSE),
('Unpaid Leave', 0, FALSE);

-- Seed data: users
-- NOTE: Run 'node scripts/generateHashes.js' after npm install to get real hashes
-- Or use the registration form to create users with proper password hashing
-- Manager password: Admin@123
-- Employee password: Emp@1234
-- Temporary hashes below - replace with real ones from generateHashes.js
INSERT INTO users (employee_id, first_name, last_name, email, password_hash, role, manager_id, department) VALUES
('EMP001', 'John', 'Manager', 'manager@company.com', '$2a$10$rZ5c3qX8YvZ5c3qX8YvZ5uK5K5K5K5K5K5K5K5K5K5K5K5K5K5K5Ke', 'manager', NULL, 'Management'),
('EMP002', 'Alice', 'Smith', 'emp1@company.com', '$2a$10$sA6d4rY9ZwA6d4rY9ZwA6vL6L6L6L6L6L6L6L6L6L6L6L6L6L6L6Lf', 'employee', 1, 'Engineering'),
('EMP003', 'Bob', 'Johnson', 'emp2@company.com', '$2a$10$sA6d4rY9ZwA6d4rY9ZwA6vL6L6L6L6L6L6L6L6L6L6L6L6L6L6L6Lf', 'employee', 1, 'Engineering'),
('EMP004', 'Carol', 'Williams', 'emp3@company.com', '$2a$10$sA6d4rY9ZwA6d4rY9ZwA6vL6L6L6L6L6L6L6L6L6L6L6L6L6L6L6Lf', 'employee', 1, 'Marketing'),
('EMP005', 'David', 'Brown', 'emp4@company.com', '$2a$10$sA6d4rY9ZwA6d4rY9ZwA6vL6L6L6L6L6L6L6L6L6L6L6L6L6L6L6Lf', 'employee', 1, 'Sales');

-- Seed data: leave_balances for current year (2026)
INSERT INTO leave_balances (user_id, leave_type_id, year, total_days, used_days) VALUES
-- Manager balances
(1, 1, 2026, 15, 0),
(1, 2, 2026, 10, 0),
(1, 3, 2026, 5, 0),
-- Employee 1 balances
(2, 1, 2026, 15, 3),
(2, 2, 2026, 10, 1),
(2, 3, 2026, 5, 0),
-- Employee 2 balances
(3, 1, 2026, 15, 5),
(3, 2, 2026, 10, 0),
(3, 3, 2026, 5, 2),
-- Employee 3 balances
(4, 1, 2026, 15, 2),
(4, 2, 2026, 10, 3),
(4, 3, 2026, 5, 1),
-- Employee 4 balances
(5, 1, 2026, 15, 0),
(5, 2, 2026, 10, 0),
(5, 3, 2026, 5, 0);

-- Seed data: sample leave_requests
INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, total_days, reason, status, reviewed_by, review_comment, reviewed_at) VALUES
(2, 1, '2026-03-10', '2026-03-12', 3, 'Family vacation', 'approved', 1, 'Approved', '2026-03-05 10:30:00'),
(2, 2, '2026-02-15', '2026-02-15', 1, 'Doctor appointment', 'approved', 1, 'Get well soon', '2026-02-14 09:00:00'),
(3, 1, '2026-04-01', '2026-04-05', 5, 'Spring break trip', 'pending', NULL, NULL, NULL),
(4, 3, '2026-03-20', '2026-03-20', 1, 'Personal matter', 'approved', 1, NULL, '2026-03-18 14:00:00'),
(3, 3, '2026-02-10', '2026-02-11', 2, 'Moving house', 'approved', 1, 'Approved', '2026-02-08 11:00:00');

-- Seed data: holidays for 2026
INSERT INTO holidays (name, date) VALUES
('New Year\'s Day', '2026-01-01'),
('Independence Day', '2026-07-04'),
('Labor Day', '2026-09-07'),
('Thanksgiving', '2026-11-26'),
('Christmas', '2026-12-25');
