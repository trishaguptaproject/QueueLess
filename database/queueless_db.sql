CREATE DATABASE IF NOT EXISTS queueless_db;

USE queueless_db;

-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50),
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    course VARCHAR(100),
    semester VARCHAR(30),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- QUEUE TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS queue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    token_number VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'WAITING',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ADMIN ACCOUNT
-- ==========================================

INSERT INTO users
(
    full_name,
    email,
    password,
    role
)
SELECT
    'QueueLess Admin',
    'admin@queueless.com',
    'admin123',
    'ADMIN'
WHERE NOT EXISTS
(
    SELECT 1
    FROM users
    WHERE email = 'admin@queueless.com'
);

-- ==========================================
-- DEMO STUDENT ACCOUNT
-- ==========================================

INSERT INTO users
(
    full_name,
    student_id,
    email,
    phone,
    department,
    course,
    semester,
    password,
    role
)
SELECT
    'Demo Student',
    'QL001',
    'student@queueless.com',
    '9999999999',
    'Computer Science',
    'BSc CS',
    'Semester 5',
    'student123',
    'STUDENT'
WHERE NOT EXISTS
(
    SELECT 1
    FROM users
    WHERE email = 'student@queueless.com'
);

-- ==========================================
-- CHECK TABLES
-- ==========================================

SELECT * FROM users;
SELECT * FROM queue;
