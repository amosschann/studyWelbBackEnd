const jwt = require('jsonwebtoken');
const fs = require('fs');

//middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  console.log('authenticating')
  //grab token from the request headers
  const token = req.headers.authorization;
  //check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token is missing' });
  }

  const privateKey = process.env.PRIVATE_KEY;

  jwt.verify(token, privateKey, (err, decoded) => {
    if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    //token exp check
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp > decoded.exp ) {
        return res.status(401).json({ message: 'Unauthorized: token expired' });
    }

    //if token is valid, you can access the decoded data (e.g., username) in your route handlers
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
