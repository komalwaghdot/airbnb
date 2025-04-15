const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'], // Custom error message
      },
    description: String,
    price: Number,
    //image: {
       // type: String,
       // default: "https://unsplash.com/photos/a-path-through-a-snowy-forest-lined-with-tall-trees-7WvSFCcAXKw",
       // set: (v) => (v === "" ? "https://unsplash.com/photos/a-path-through-a-snowy-forest-lined-with-tall-trees-7WvSFCcAXKw",
       //  : v),
    //},
    image: {
        filename: {
          type: String,
          default: 'defaultfilename',
        },
        url: {
          type: String,
          default: 'https://unsplash.com/photos/a-path-through-a-snowy-forest-lined-with-tall-trees-7WvSFCcAXKw',
        },
    },
    
    location: String,
    country: String,
    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      },
    ],
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});

  }
});

const Listing = mongoose.model("Listing", listingSchema); // Corrected capitalization of "Listing"
module.exports = Listing;
