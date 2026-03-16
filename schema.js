const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.any(),
        geometry: Joi.any().optional(),
        category: Joi.string().valid(
            "Trending", "Rooms", "Iconic Cities", "Mountains", "Nature",
            "Pool", "Camping", "Farm", "Arctic", "Dome", "Boat"
        ).optional().allow(""),
    }).required(),
});

//review schema
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),

    }).required()
});

// booking schema
module.exports.bookingSchema = Joi.object({
    checkIn: Joi.date().required(),
    checkOut: Joi.date().required().greater(Joi.ref('checkIn')),
    guests: Joi.number().required().min(1).max(20),
});
