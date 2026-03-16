const Listing = require("../models/listing.js");

const ITEMS_PER_PAGE = 12;

module.exports.index = async (req, res) => {
  const { search, category, sort, page } = req.query;
  let filter = {};
  let currentPage = parseInt(page) || 1;
  if (currentPage < 1) currentPage = 1;

  // Search filter
  if (search && search.trim() !== "") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  // Category filter
  if (category && category.trim() !== "" && category !== "All") {
    filter.category = category;
  }

  // Sort options
  let sortOption = {};
  if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  } else if (sort === "newest") {
    sortOption = { createdAt: -1 };
  } else {
    sortOption = { _id: -1 }; // default newest
  }

  // Count total for pagination
  const totalListings = await Listing.countDocuments(filter);
  const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const allListings = await Listing.find(filter)
    .sort(sortOption)
    .skip((currentPage - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render("listings/index.ejs", {
    allListings,
    search: search || "",
    category: category || "",
    sort: sort || "",
    currentPage,
    totalPages,
    totalListings,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  }).populate("owner");
  if (!listing) {
    req.flash("error", "listing you requested for does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    if (!req.body || !req.body.listing) {
      return res.status(400).send("Bad Request: listing data missing");
    }

    const { title, description, price, location, country, category } = req.body.listing;

    // Fetch coordinates from Nominatim
    let geometry = { type: "Point", coordinates: [0, 0] };
    try {
      const query = encodeURIComponent(`${location}, ${country}`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'User-Agent': 'Wanderlust-App' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        geometry.coordinates = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
      category: category || undefined,
      owner: req.user._id,
      geometry
    });

    // Use the uploaded file directly
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    await newListing.save();
    req.flash("success", "New listing created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).send("Internal Server Error");
  }
};


module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { location, country } = req.body.listing;

  const listing = await Listing.findById(id);

  // If location changed, update geometry
  if (location !== listing.location || country !== listing.country) {
    try {
      const query = encodeURIComponent(`${location}, ${country}`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'User-Agent': 'Wanderlust-App' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        };
      }
    } catch (err) {
      console.error("Geocoding error during update:", err);
    }
  }

  // Update other fields
  Object.assign(listing, req.body.listing);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.distroyListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "listing deleted");
  res.redirect("/listings");
};