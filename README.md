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

