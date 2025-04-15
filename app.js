
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const allListings = require('./init/data.js');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js")
const {listingSchema,reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parses incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));


async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((err) => {
        console.log(err);
    });

// Root route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});



// Test route for adding a sample listing
app.get("/testlisting", async (req, res) => {
    let sampleListing = new Listing({
        title: "New Villa",
        description: "By the villa",
        price: 1200,
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?...",
        },
        location: "Goa",
        country: "India",
    });
    await sampleListing.save();
    console.log("Sample was saved");
    res.send("Successful testing");
});

// Route for displaying all listings
app.get("/listings", wrapAsync (async(req, res) => {
    const allListings =await Listing.find({});
    res.render("listings/index.ejs", { allListings }); 
}));

const validateListing=(req,res,next)=>{
    let {error}=  listingSchema.validate(req.body);
    
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();

    }
};

const validateReview=(req,res,next)=>{
    let {error}=  reviewSchema.validate(req.body);
    
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();

    }
};

// Route for creating a new listing form
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Route for showing a specific listing
app.get("/listing/:id", wrapAsync(async(req, res) => {

        const { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews");

        
        res.render("listings/show.ejs", { listing });
}));
    

// Route for creating a new listing
/*app.post("/listings",validateListing,wrapAsync( async (req, res) => {
   
    const { title, description, price, location, country } = req.body;
   
    const newListing = new Listing({ title, description, price, location, country });
    await newListing.save();
    res.redirect("/listings");
}));*/
// Route for creating a new listing
/*app.post("/listings", validateListing, wrapAsync(async (req, res) => {
    try {
        const { title, description, price, location, country, image } = req.body;

        // Decode the image URL if it exists
        if (image?.url) {
            image.url = decodeURIComponent(image.url);
        }

        // Create a new listing with all fields
        const newListing = new Listing({ title, description, price, location, country });

        // If an image is provided, add it to the listing
        if (image) {
            newListing.image = image;
        }

        // Save the new listing
        await newListing.save();
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        res.status(500).send("Internal Server Error");
    }
}));*/
app.post("/listings", (req, res, next) => {
    console.log("🔥 Incoming Request to /listings");

    // Log the entire request body
    console.log("📝 Received Data:", req.body);

    next(); // Continue to the validation middleware
}, validateListing, wrapAsync(async (req, res) => {
    console.log("✅ Passed Validation, Processing Data");

    try {
        const { title, description, price, location, country, image } = req.body.listing;

        if (image?.url) {
            console.log("🔍 Before Decoding:", image.url);
            image.url = decodeURIComponent(image.url);
            console.log("✅ After Decoding:", image.url);
        }

        const newListing = new Listing({ title, description, price, location, country });

        if (image && image.url) {
            newListing.image = image;
        }

        await newListing.save();
        console.log("✅ Successfully Saved Listing!");
        res.redirect("/listings");
    } catch (error) {
        console.error("❌ Error creating listing:", error);
        res.status(500).send("Internal Server Error");
    }
}));



// Route for displaying the edit form for a listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    const listing = await Listing.findById(id);
       
    res.render("listings/edit.ejs", { listing });
   
}));

// Route for updating a listing

// Route to handle the form submission and update the listing
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, price, location, country,image } = req.body;


   // Find the listing and update with the new data
    const listing = await Listing.findByIdAndUpdate(
        id,
        { title, description, price, location, country,image },
        { new: true } // Return the updated document
    );
        // Redirect to the updated listing page
    res.redirect(`/listings/${listing._id}`);
    
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");   
    res.render("listings/show.ejs", { listing });    
}));

//DELETE ROUTE
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");

}));
//reviews
//post route for reviews
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);


    listing.reviews.push(newReview);
    console.log("Before saving review:", newReview);



    await newReview.save();
    await listing.save();

    console.log("new review saved");
    
    res.redirect(`/listings/${listing._id}`);


}));
//delete route for reviews
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);


}));


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode=500, message="something went wrong"}=err;
    res.status(statusCode).render("listings/error.ejs",{err});
    //res.status(statusCode).send(message);
});

app.listen(4000, () => {
    console.log("Server is listening on port 4000");
});
