const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const profileController = require("../controllers/profile.js");

// Show user profile and their wishlist/listings
router.get("/:id", isLoggedIn, wrapAsync(profileController.showProfile));

// Toggle a listing in the wishlist
router.post("/wishlist/:id", isLoggedIn, wrapAsync(profileController.toggleWishlist));

module.exports = router;
