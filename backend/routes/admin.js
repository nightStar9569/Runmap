const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// USERS
router.get('/users', auth, admin, adminController.listUsers);
router.post('/users', auth, admin, adminController.getUser);
router.post('/users/create', auth, admin, adminController.createUser);
router.post('/users/update', auth, admin, adminController.updateUser);
router.post('/users/delete', auth, admin, adminController.deleteUser);

// EVENTS
router.get('/events', auth, admin, adminController.listEvents);
router.post('/events/create', auth, admin, adminController.createEvent);
router.post('/events/update', auth, admin, adminController.updateEvent);
router.post('/events/delete', auth, admin, adminController.deleteEvent);

// ADS
router.get('/ads', auth, admin, adminController.listAds);
router.post('/ads/create', auth, admin, adminController.createAd);
router.post('/ads/update', auth, admin, adminController.updateAd);
router.post('/ads/delete', auth, admin, adminController.deleteAd);

// Public route for cities
router.get('/cities-grouped', adminController.getCitiesGroupedByRegion);

module.exports = router; 