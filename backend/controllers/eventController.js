const Event = require('../models').Event;
const Joi = require('joi');

const createEventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  date: Joi.date().required(),
  location: Joi.string().min(3).max(100).required(),
  imageUrl: Joi.string().min(3).max(255).optional()
});

// List events with pagination and optional filtering
exports.listEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.location) where.location = req.query.location;
    if (req.query.date) where.date = req.query.date;
    const { count, rows } = await Event.findAndCountAll({ where, limit, offset, order: [['date', 'ASC']] });
    res.json({ events: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get event details by ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { error } = createEventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { name, description, date, applyDeadline, location, imageUrl } = req.body;
    if (!name || !date || !location) {
      return res.status(400).json({ message: 'Name, date, and location are required.' });
    }
    const event = await Event.create({ name, description, date, applyDeadline, location, imageUrl });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update an event by ID
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const { name, description, date, location, imageUrl } = req.body;
    await event.update({ name, description, date, location, imageUrl });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete an event by ID
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.destroy();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 