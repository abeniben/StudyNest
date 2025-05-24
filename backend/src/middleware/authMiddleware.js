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
    console.log('Decoded JWT:', decoded); // Debug log

    const user = await User.findById(decoded.userId);
    console.log('User query result:', user); // Debug log

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check token version for auto-logout, default to 0 if undefined
    const tokenVersion = decoded.tokenVersion ?? 0;
    if (tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error); // Debug log
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired' });
    }
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};