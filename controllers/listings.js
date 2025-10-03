const Listing = require("../models/listing");
const { config, geocoding } = require("@maptiler/client");
const mapToken = process.env.MAP_TOKEN;
config.apiKey = mapToken;


module.exports.index = async (req, res) => {
  const query = req.query.q || "";            
  const categories = req.query.category;      
  let filter = {};

  // Text search
  if (query) {
    const regex = new RegExp(query, "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { category: regex } 
    ];
  }

  // Category filter (multiple categories possible)
  if (categories) {
    
    const catArray = Array.isArray(categories) ? categories : [categories];
    filter.category = { $in: catArray };
  }

  // Fetch listings
  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", { 
    allListings, 
    query, 
    category: categories 
  });
};

module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"},}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }else {
        console.log(listing);
        res.render("listings/show.ejs", {listing});
    };
};

module.exports.createListing = async (req, res)=>{
    const result = await geocoding.forward(req.body.listing.location, { limit: 1 });
       
    let url = req.file.path;
    let filename = req. file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = result.features[0].geometry;
    await newListing.save();
    
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for doesn't exist!");
        res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", {listing, originalImageUrl});
    
};

module.exports.updateListing = async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req. file.filename;
    listing.image = {url, filename};
    await listing.save();
    };

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};