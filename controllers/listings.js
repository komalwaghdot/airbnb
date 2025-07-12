const Listing=require("../models/listing.js");

module.exports.index=async(req, res) => {
    const allListings =await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
  
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req, res) => {

        const { id } = req.params;
        const listing = await Listing.findById(req.params.id).populate({
          path:"reviews",
          populate:{
            path:"author",
          },
        }).populate("owner");
        if(!listing){
          req.flash("error","listing you requested for does not exist");
          res.redirect("/listings");
        }

        
        res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    if (!req.body || !req.body.listing) {
      return res.status(400).send("Bad Request: listing data missing");
    }

    const { title, description, price, location, country } = req.body.listing;

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
      owner: req.user._id
    });

    // ✅ Use the uploaded file directly
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await newListing.save();

    res.redirect("/listings");
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).send("Internal Server Error");
  }
};


 module.exports.renderEditForm=async (req, res) => {
     const { id } = req.params;
     
     const listing = await Listing.findById(id);
        
     res.render("listings/edit.ejs", { listing });
    
 };

 module.exports.updateListing=async (req, res) => {
    const { id } = req.params;
    console.log("req.body:", req.body);

    const listing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true }
    );
    if(typeof req.file!=="undefined"){
       let url=req.file.path;
      let filename=req.file.filename;
       listing.image={url,filename};
       await listing.save();

    }
   
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
  };

 module.exports.distroyListing=async(req,res)=>{
     let {id}=req.params;
     let deleted=await Listing.findByIdAndDelete(id);
     console.log(deleted);
     req.flash("success","listing deleted");
     res.redirect("/listings");
 
 };