-- Test users for Queuing System
-- Run this SQL in your MySQL database

INSERT INTO user (username, password, first_name, last_name, role) VALUES
('admin', '$2b$12$owDJ3krZZJwdPEytWBuGkeoxa9oD4y1SSnmD0zpYLZuP74HNbGk2u', 'Admin', 'User', 'admin'),
('doctor1', '$2b$12$kQlM7hgqA4KZURBzcXjCG.yBA.22IDSBRDbK3BcqTx8EuOq4nJk4a', 'John', 'Smith', 'doctor'),
('doctor2', '$2b$12$kQlM7hgqA4KZURBzcXjCG.yBA.22IDSBRDbK3BcqTx8EuOq4nJk4a', 'Sarah', 'Johnson', 'doctor'),
('frontdesk', '$2b$12$MyUl4T46Hn0Z9rk3kcxJKOAzYYMpB4rJeIYDjLOP9tjGmx8CE0EH6', 'Front', 'Desk', 'front_desk');
