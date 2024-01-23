const mysql = require('mysql2');
require('dotenv').config();

// Database connection
console.log(process.env.host)
const database = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.database
});


module.exports = database;