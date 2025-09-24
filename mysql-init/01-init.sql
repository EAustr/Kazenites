-- Initial database setup for Docker
CREATE DATABASE IF NOT EXISTS kazenitesdb;
USE kazenitesdb;

-- Grant privileges to kazenites user
GRANT ALL PRIVILEGES ON kazenitesdb.* TO 'kazenites'@'%';
FLUSH PRIVILEGES;