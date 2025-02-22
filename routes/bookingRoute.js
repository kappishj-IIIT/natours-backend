const express = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Public Route
router.get('/checkout-session/:tourId', bookingController.getCheckOutSession);

// Restrict routes to admin and lead-guide
router.use(authController.restrictTo('admin', 'lead-guide'));

// Correct way to define routes
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
