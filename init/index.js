const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
    await mongoose.connect(MONGO_URL);
}


main()
    .then(() => {
        console.log("connection sucessful");
    })
    .catch((err) => {
        console.log(err);
    });

const initDB = async () => {
    await Listing.deleteMany({});
    const initializedData = initdata.data.map((obj) => ({
        ...obj,
        owner: "678c9f2ba18453fda5fee39c",
        geometry: obj.geometry || { type: "Point", coordinates: [0, 0] }
    }));
    await Listing.insertMany(initializedData);
    console.log("data was initilised");
};
initDB();
