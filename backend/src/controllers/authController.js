const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.status = 422;
    error.details = errors.array();
    throw error;
  }
};

const register = async (req, res, next) => {
  try {
    handleValidation(req);
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'user' });
    const token = generateToken(user);
    const cookieName = process.env.ACCESS_COOKIE_NAME || 'access_token';
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return res.status(201).json({ user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    handleValidation(req);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user);
    const cookieName = process.env.ACCESS_COOKIE_NAME || 'access_token';
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    return res.json({ user: user.toJSON() });
  } catch (err) {
    return next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return res.json({ user: req.user.toJSON() });
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const cookieName = process.env.ACCESS_COOKIE_NAME || 'access_token';
    res.clearCookie(cookieName);
    return res.json({ message: 'Logged out' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, getProfile, logout };


