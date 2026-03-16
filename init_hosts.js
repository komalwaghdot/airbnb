const mongoose = require("mongoose");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function makeAllHosts() {
    await mongoose.connect(MONGO_URL);
    const result = await User.updateMany({}, { $set: { role: 'host' } });
    console.log(`Updated ${result.modifiedCount} users to host role.`);
    mongoose.connection.close();
}

makeAllHosts();
