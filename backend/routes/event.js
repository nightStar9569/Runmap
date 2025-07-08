const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// List events
router.get('/', eventController.listEvents);
// Get event detail
router.get('/:id', eventController.getEvent);
// Create event (protected)
router.post('/create', auth, admin, eventController.createEvent);
// Update event (protected)
router.put('/:id', auth, admin, eventController.updateEvent);
// Delete event (protected)
router.delete('/:id', auth, admin, eventController.deleteEvent);

module.exports = router; 