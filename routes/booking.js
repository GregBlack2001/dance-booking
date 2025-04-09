const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Create booking (requires authentication)
router.post('/', auth.authenticate, BookingController.createBooking);

// Cancel booking (requires authentication)
router.get('/cancel/:id', auth.authenticate, BookingController.cancelBooking);

// API Endpoints (admin only)
router.get('/api/class/:classId', auth.authenticate, auth.isAdmin, BookingController.apiGetClassBookings);

module.exports = router;