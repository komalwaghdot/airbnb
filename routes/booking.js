const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Render booking form
router.get("/:id/book", isLoggedIn, wrapAsync(bookingController.renderBookingForm));

// Create a booking
router.post("/:id", isLoggedIn, wrapAsync(bookingController.createBooking));

// Cancel a booking
router.delete("/:id", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
