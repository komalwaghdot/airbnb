const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing= require("../models/listing.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
async function main(){
    await mongoose.connect(MONGO_URL);
}


main()
.then(()=>{
    console.log("connection sucessful");
})
.catch((err)=>{
    console.log(err);
});

const initDB=async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("data was initilised");
};
initDB();
