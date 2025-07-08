const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models').User;

const JWT_SECRET = process.env.JWT_SECRET || 'SECURITY';

exports.register = async (req, res) => {
  try {
    const { username, email, password, membershipStatus, notificationEnabled } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, membershipStatus, notificationEnabled });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 