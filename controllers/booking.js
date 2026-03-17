const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.renderBookingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("bookings/book.ejs", { listing });
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    
    if (!req.body.booking) {
        req.flash("error", "Invalid booking data submission");
        return res.redirect(`/bookings/${id}/book`);
    }

    const { checkIn, checkOut, guests } = req.body.booking;

    if (!checkIn || !checkOut || !guests) {
        req.flash("error", "Please fill in all required fields");
        return res.redirect(`/bookings/${id}/book`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    const date1 = new Date(checkIn);
    const date2 = new Date(checkOut);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime()) || date2 <= date1) {
        req.flash("error", "Invalid check-in or check-out dates");
        return res.redirect(`/bookings/${id}/book`);
    }

    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const totalPrice = (diffDays * listing.price) * 1.18; // Including 18% GST

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
