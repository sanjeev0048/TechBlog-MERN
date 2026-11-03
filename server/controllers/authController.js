import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(userId, role) {
  const secret = process.env.JWT_SECRET || 'techpulse_dev_jwt_secret_key_change_in_production_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({ id: userId, role }, secret, { expiresIn });
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact an administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user._id, user.role);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({
    user: req.user
  });
}

export async function logout(req, res) {
  res.json({ message: 'Logged out successfully.' });
}
