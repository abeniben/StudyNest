const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { resend, getPasswordResetEmail } = require('../config/resend');


exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters, including uppercase, lowercase, number, and special character'
      });
    }

    // Create new user (password hashing handled by User model pre-save hook)
    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      message: 'User details retrieved',
      user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let isModified = false;

    if (name) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({ message: 'Name must be 2-50 characters' });
      }
      user.name = name.trim();
      isModified = true;
    }

    
    if (email && email !== user.email) {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      user.email = email.toLowerCase().trim();
      isModified = true;
    }

    
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to update password' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect current password' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message: 'New password must be at least 8 characters, including uppercase, lowercase, number, and special character'
        });
      }

      user.password = newPassword;
      user.tokenVersion += 1; // Invalidate existing tokens
      isModified = true;
    }

    // Save if modified
    if (isModified) {
      await user.save();
      console.log('User saved:', user);
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Invalid input', errors: messages });
    }
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};


exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to logout', error: error.message });
  }
};




exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'Reset link sent to email' }); // Prevent email enumeration
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordHash = await bcrypt.hash(resetToken, 10);
    user.resetPasswordHash = resetPasswordHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    await resend.emails.send({
      from: 'StudyNest <no-reply@studynest.app>',
      to: user.email,
      subject: 'Reset Your StudyNest Password',
      html: getPasswordResetEmail(user.name, resetUrl)
    });

    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset link', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: 'New password must be at least 8 characters, including uppercase, lowercase, number, and special character'
      });
    }

    const user = await User.findOne({
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordHash +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Verify token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordHash);
    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.resetPasswordHash = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion += 1; // Invalidate existing tokens
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};