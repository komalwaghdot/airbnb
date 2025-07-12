if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const allListings = require('./init/data.js');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");
const user = require("./models/user.js");
const listingRouter=require("./routes/listing.js");

const reviewRouter=require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const dbUrl=process.env.ATLASDB_URL;





app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Parses incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);

});

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:"false",
    saveUnintialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};

/* Root route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});*/





app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    
    next();
});


async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("Connection successful");
    })
    .catch((err) => {
        console.log(err);
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

app.use("/listings",listingRouter);
app.use("/listing",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/",userRouter);





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
