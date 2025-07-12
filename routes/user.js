const express=require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport =require("passport");
const {savedRedirectUrl}=require("../middleware.js");
const userController=require("../controllers/user.js");

router.get("/signup",userController.renderSignupForm);

router.post("/signup",userController.signup);

router.get("/login",userController.login);

router.post("/login",savedRedirectUrl, passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}), async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust");
    let redirectUrl=res.locals.redirectUrl||"/listings";
    res.redirect(redirectUrl);
});

router.get("/logout", userController.logout);





module.exports=router;