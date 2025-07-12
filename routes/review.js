const express=require("express");
const router=express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const Review = require("../models/review.js");
const {validateReview} =require("../middleware.js");
const {isLoggedIn}=require("../middleware.js");
const {isReviewAuthor}=require("../middleware.js");
const reviewController=require("../controllers/review.js");





router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//delete route for reviews
router.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.destroyReview));

module.exports=router;