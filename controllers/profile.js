const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.showProfile = async (req, res) => {
    const { id } = req.params;
    const activeTab = req.query.tab || 'listings';
    const userProfile = await User.findById(id).populate("wishlist");
    if (!userProfile) {
        req.flash("error", "User not found");
        return res.redirect("/listings");
    }
    const userListings = await Listing.find({ owner: id });
    const Booking = require("../models/booking.js");
    const userBookings = await Booking.find({ customer: id }).populate("listing");
    res.render("users/profile.ejs", { userProfile, userListings, userBookings });
};

module.exports.toggleWishlist = async (req, res) => {
    const { id } = req.params; // listing id
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.wishlist.includes(id)) {
        user.wishlist.pull(id);
        await user.save();
        req.flash("success", "Listing removed from wishlist");
    } else {
        user.wishlist.push(id);
        await user.save();
        req.flash("success", "Listing saved to wishlist");
    }

    const referer = req.get("Referrer") || `/listings/${id}`;
    res.redirect(referer);
};
