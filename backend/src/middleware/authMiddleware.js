
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      console.log("Decoded id: ", decoded)
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check token version for auto-logout
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    }
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};