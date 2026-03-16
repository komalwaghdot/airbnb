const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
// ✅ Add this line
//const Review = require("./models/review.js");
const { isLoggedIn, isHost, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });










// Route for displaying all listings
router.get("/", wrapAsync(listingController.index));

// Route for creating a new listing form
router.get("/new", isLoggedIn, isHost, listingController.renderNewForm);

// Route for showing a specific listing
router.get("/:id", wrapAsync(listingController.showListing));



router.post(
  "/",
  (req, res, next) => {
    console.log("🔥 Incoming Request to /listings");
    console.log("📝 Received Data:", req.body);
    next();
  },
  isLoggedIn,
  isHost,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing),
);






// Route for displaying the edit form for a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Route for updating a listing

// Route to handle the form submission and update the listing
router.put("/:id", isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing));



//DELETE ROUTE
router.delete("/:id", isLoggedIn, wrapAsync(listingController.distroyListing));


module.exports = router;
