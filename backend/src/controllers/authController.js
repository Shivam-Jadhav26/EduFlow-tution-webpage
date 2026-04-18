const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const signToken = (id, role, email) =>
  jwt.sign({ id, role, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required.', 400);
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = signToken(user._id, user.role, user.email);

    return sendSuccess(res, { user: user.toPublic(), token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, class: studentClass, phone, parentName, parentPhone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: 'student',
      class: studentClass,
      phone,
      parentName,
      parentPhone,
      status: 'pending',
    });

    const token = signToken(user._id, user.role, user.email);

    return sendSuccess(
      res,
      { user: user.toPublic(), token },
      'Registration successful. Awaiting admin approval.',
      201
    );
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).populate('batch', 'name class schedule');
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/me — update own profile
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, parentName, parentPhone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, parentName, parentPhone, avatar },
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe, updateMe };
