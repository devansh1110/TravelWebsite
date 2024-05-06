const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewFrom = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  // id = id.slice(0, -1);
  const listing = await Listing.findById(id).populate("owner");
  res.render("listings/show.ejs", { listing });
};

module.exports.newListing = async (req, res, next) => {
  let url= req.file.path;
  let filename= req.file.filename;
  let listing = req.body.listing;
  listing.owner = req.user._id;
  listing.image= {url, filename};
  await new Listing(listing).save();
  req.flash("success", "New Listing(s) have been added!!");
  console.log(listing);
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateAndValidateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUsr._id)) {
    req.flash("success", "You dont have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  let listings= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  let url= req.file.path;
  let filename= req.file.filename;
  listings.image= {url, filename};
  await new Listing(listings).save();
  req.flash("success", "Listing(s) have been updated!!");
  res.redirect("/listings");
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "New Listing(s) have been deleted!!");
  res.redirect("/listings");
};
