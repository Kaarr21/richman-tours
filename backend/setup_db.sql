-- Create database and user for Richman Tours
CREATE DATABASE richman_tours_db;
CREATE USER richman_tours_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE richman_tours_db TO richman_tours_user;
ALTER USER richman_tours_user CREATEDB;
