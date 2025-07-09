const User = require('../models').User;
const Event = require('../models').Event;
const Ad = require('../models').Ad;

// USERS
exports.listUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.body.id, { attributes: { exclude: ['password'] } });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.body.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const { username, email, isAdmin, membershipStatus } = req.body;
  await user.update({ username, email, isAdmin, membershipStatus });
  const { password, ...userData } = user.toJSON();
  res.json({ message: 'User updated.', user: userData });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.body.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await user.destroy();
  res.json({ message: 'User deleted.' });
};

// EVENTS
exports.listEvents = async (req, res) => {
  const events = await Event.findAll();
  res.json(events);
};

exports.createEvent = async (req, res) => {
  const { name, description, date, location, imageUrl } = req.body;
  const event = await Event.create({ name, description, date, location, imageUrl });
  res.status(201).json(event);
};

exports.updateEvent = async (req, res) => {
  const event = await Event.findByPk(req.body.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  const { name, description, date, location, imageUrl } = req.body;
  await event.update({ name, description, date, location, imageUrl });
  res.json(event);
};

exports.deleteEvent = async (req, res) => {
  const event = await Event.findByPk(req.body.id);
  if (!event) return res.status(404).json({ message: 'Event not found.' });
  await event.destroy();
  res.json({ message: 'Event deleted.' });
};

// ADS
exports.listAds = async (req, res) => {
  const ads = await Ad.findAll();
  res.json(ads);
};

exports.createAd = async (req, res) => {
  const { title, imageUrl, link, status, startDate, endDate } = req.body;
  const ad = await Ad.create({ title, imageUrl, link, status, startDate, endDate });
  res.status(201).json(ad);
};

exports.updateAd = async (req, res) => {
  const ad = await Ad.findByPk(req.body.id);
  if (!ad) return res.status(404).json({ message: 'Ad not found.' });
  const { title, imageUrl, link, status, startDate, endDate } = req.body;
  await ad.update({ title, imageUrl, link, status, startDate, endDate });
  res.json(ad);
};

exports.deleteAd = async (req, res) => {
  const ad = await Ad.findByPk(req.body.id);
  if (!ad) return res.status(404).json({ message: 'Ad not found.' });
  await ad.destroy();
  res.json({ message: 'Ad deleted.' });
}; 