const Joi = require('joi');

module.exports.listingSchema=Joi.object({
    listing : Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price:Joi.number().required().min(0),
        image: Joi.any() // 👈 allow it, but it's redundant
        
        /*image: Joi.string().uri().optional()
        image: Joi.object({
            filename: Joi.string().optional(),
            //url: Joi.string().uri().optional() // Ensure it allows valid URLs
            url: Joi.string()
                .uri()
                .allow("")
                .optional()
        }).optional() ,*/
         
    }).required(),
});

//review schema
module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),

    }).required()
});



