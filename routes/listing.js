const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const expressError = require("../utils/expressError.js");
const { isLoggedIn } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage}= require('../cloudConfig.js');
const upload = multer({storage});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new expressError("Validation failed", 400, error);
  } else {
    next();
  }
};

//index route
router.get("/", wrapAsync(listingController.index));

//new route
router.get("/new", isLoggedIn, listingController.renderNewFrom);

//show route   res.send(listing.reviews);
router.get("/:id", wrapAsync(listingController.showListing));

// create route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.newListing),
);

//edit route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.editListing));

// update route validateListing,
router.put(
  "/:id",
  isLoggedIn,
  upload.single("listing[image]"),
  wrapAsync(listingController.updateAndValidateListing)
);

//delete route
router.delete("/:id", isLoggedIn, wrapAsync(listingController.deleteListing));

module.exports = router;
