const express = require('express');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const taskDaysRouter = require('./routes/taskdays');
const database = require('./helpers/database');
const tasksRouter = require('./routes/tasks');
const journalsRouter = require('./routes/journals');

const app = express();
// Enable CORS
app.use(cors());

// Enable the use of request body parsing middleware
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
  limit: '5mb',
  extended: true
}));

database.connect((err => {
  if (err) throw err;
  console.log('MySQL Connected!');
}));


//API endpoints
app.use('/api/auth/', authRouter);
app.use('/api/users/', usersRouter);
app.use('/api/taskDays/', taskDaysRouter);
app.use('/api/tasks/', tasksRouter);
app.use('/api/journals/', journalsRouter);

module.exports = app;
