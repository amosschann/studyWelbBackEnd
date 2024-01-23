const express = require('express');
const usersRouter = express.Router();
const database = require('../helpers/database');
const bcrypt = require('bcrypt');
const { handleServerError } = require('../helpers/errorHelper');
const authenticateToken = require('../helpers/tokenHelper');
const saltRounds = 10;


/*SignUp*/
//without middleware
usersRouter.post('/signup', async (req, res) => {
  const { profileName, email, password } = req.body;

  try {
    //check for repeat email
    let userQuery = 'SELECT * FROM users WHERE email = ?';
    database.query(userQuery, email, (err, result) => {
      if (err) {
        handleServerError(res, err);
      } else {
        if (result.length !== 0) {
          console.log(result)
          res.status(500).json({ message: 'Existing email exists' });
        } else {
          //hash and store
          bcrypt.hash(password, saltRounds, function(err, hash) {
            let insertUserQuery = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
            const values = [email, hash, profileName];
            database.query(insertUserQuery, values, (err, result) => {
              if (err) {
                handleServerError(res, err);
              } else {
                console.log('User signed up successfully');
                res.status(200).json({ message: 'User signed up successfully' });
              }
            });
        });
        }
      }
    });
  } catch (err) {
    handleServerError(res, err);
  }
});

//with middleware
usersRouter.get('/user-profile-detail', authenticateToken, async (req, res) => {
  const { user_id } = req.user;
  try {
  let userQuery = 'SELECT name, email FROM users WHERE id = ?'
  database.query(userQuery, user_id, (err, result) => {
    if (err) {
      handleServerError(res, err);
    } else {
      if (result.length === 0) {
        res.status(500).json({ message: 'Error in getting user profile details' });
      } else {
        console.log(result)
        res.status(200).json({ result });
      }
    }
  });
} catch (err) {
  handleServerError(res, err);
}
});

module.exports = usersRouter;
