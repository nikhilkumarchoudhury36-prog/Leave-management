-- Quick setup script
-- Run this in MySQL: mysql -u root -p < setup-database.sql

CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_balances;
DROP TABLE IF EXISTS holidays;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS users;

-- Now run the main schema
SOURCE database/schema.sql;
