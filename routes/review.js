const express= require('express');
const router= express.Router({mergeParams: true});
const {listingSchema, reviewSchema}= require( '../schema.js');
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');


const validateReview= (req, res, next)=>{
    let {error}= reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map(el => el.message).join(", ");
        throw new  expressError(errMsg, 400, error)
} else {
    next();
}}


//review
router.post('/',validateReview, wrapAsync(async (req, res) => {
    try {
        let listing = await Listing.findById(req.params.id);
        let newReview = new Review({
            comment: req.body.review.comment,
            rating: req.body.review.rating
        });
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        console.log("Saved Review to database");
        res.redirect(`/listings/${listing._id}`)
    } catch (error) {
        console.error("Error saving review:", error);
        res.status(500).send("Error saving review");
    }
}));

//delete review
router.delete('/:reviewId', wrapAsync(async(req, res)=>{
    let {id, reviewId}= req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {review: reviewId}});
    await  Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));


module.exports= router;