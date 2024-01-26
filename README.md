start from backend folder for nodemon to track all folders -
nodemon src/bin/www.js 


MySQL database creation:
CREATE DATABASE studywelb;

MySQL table creations:

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE taskdays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    taskdays_id INT,
    task_title VARCHAR(12),
    task_description VARCHAR(255),
    start_time TIME,
    end_time TIME,
    mood INT,
    FOREIGN KEY (taskdays_id) REFERENCES taskdays(id)
);

CREATE TABLE journals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    taskdays_id INT,
    gratitude VARCHAR(255),
    general VARCHAR(255),
    mood VARCHAR(255),
    overallmood INT,
    FOREIGN KEY (taskdays_id) REFERENCES taskdays(id)
);

CREATE TABLE wellness (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(12),
    description VARCHAR(255)
);