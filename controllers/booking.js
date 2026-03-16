const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const totalPrice = diffDays * listing.price;

    const newBooking = new Booking({
        listing: id,
        customer: req.user._id,
        checkIn,
        checkOut,
        guests,
        totalPrice
    });

    await newBooking.save();
    req.flash("success", "Booking confirmed! Enjoy your stay.");
    res.redirect(`/profile/${req.user._id}`);
};

module.exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    req.flash("success", "Booking cancelled.");
    res.redirect(`/profile/${req.user._id}`);
};
