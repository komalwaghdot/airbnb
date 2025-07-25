const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originialUrl;
    req.flash("error","you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();

};

module.exports.savedRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner=async(req,res,next)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error","you are not owner of this listing");
    return res.redirect(`/listing/${id}`);
  }

  next();

};

module.exports.validateListing = (req, res, next) => {
  // If Multer put the file in req.file, put its info into req.body.listing.image
  if (req.file) {
    if (!req.body.listing) req.body.listing = {};
    req.body.listing.image = req.file.path; // or req.file.filename
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


module.exports.validateReview=(req,res,next)=>{
    let {error}=  reviewSchema.validate(req.body);
    
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();

    }
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};




module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const foundReview = await Review.findById(reviewId);

  if (!foundReview) {
    req.flash('error', 'Review not found!');
    return res.redirect(`/listings/${id}`);
  }

  if (!foundReview.author.equals(res.locals.currUser._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/listings/${id}`);
  }

  next();
};