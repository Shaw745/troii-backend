const PROPERTY = require("../models/property");
const cloudinary = require("cloudinary").v2;

const createProperty = async (req, res) => {
  const { userId } = req.user;
  const {
    title,
    description,
    location,
    bedroom,
    livingRoom,
    kitchen,
    toilet,
    paymentPeriod,
    price,
  } = req.body;
  if (
    !title ||
    !description ||
    !location ||
    !bedroom ||
    !livingRoom ||
    !kitchen ||
    !toilet ||
    !paymentPeriod ||
    !price
  ) {
    return res.status(400).json({ message: "Please fill all fields" });
  }
  try {
    //  handle images upload
    let uploadedImages = [];
    if (req.files?.images) {
      const uploadPromises = req.files.images.map((image) =>
        cloudinary.uploader.upload(image.tempFilePath, {
          folder: "torii-gate/properties",
          unique_filename: false,
          use_filename: true,
        })
      );
      const results = await Promise.all(uploadPromises);
      uploadedImages = results.map((result) => result.secure_url);
    }
    // create property on the db
    const property = await PROPERTY.create({
      title,
      description,
      location,
      bedroom,
      livingRoom,
      kitchen,
      toilet,
      paymentPeriod,
      price,
      images: uploadedImages, // store the uploaded image URLs
      landlord: userId, // associate the property with the landlord
    });
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteProperty = async(req, res)=>{


  const { userId } = req.user
  const {propertyId} = req.params
  try{
    await PROPERTY.findOneAndDelete({ landlord:userId, _id:propertyId});
    res.status(200).json({success: true, message:"property deleted successfully"});
  } catch(error){
    console.error(error);
    res.status(500).json({ message:error.message });
  }

}

const getLandlordsProperties = async (req, res) => {
  const { userId } = req.user;
  const { page = 1 } = req.query;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    const properties = await PROPERTY.find({ landlord: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const [total, availableProperties, rentedProperties] = await Promise.all([
      PROPERTY.countDocuments({ landlord: userId }),
      PROPERTY.countDocuments({ landlord: userId, availability: "available" }),
      PROPERTY.countDocuments({ landlord: userId, availability: "rented" }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      availableProperties,
      rentedProperties,
      properties,
      currentPage: parseInt(page),
      totalPages,
      properties,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const updatePropertyAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { availability } = req.body;
  if (!availability) {
    return res.status(400).json({ message: "Provide Availability " });
  }
  try {
    const property = await PROPERTY.findById(propertyId);
    property.availability = availability;
    await property.save();
    res.status(200).json({
      message: "Status updated successfully",
      property,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//find()
const getAllProperties = async (req, res) => {
  const { page = 1, location, budget, type } = req.query;
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const filter = {
      availability: "available",
    };
    if (location) {
      filter.location = { $regex: location, $options: "i" }; // case-insensitive search
    }
    if (budget) {
      filter.price = { $lte: parseInt(budget) }; // filter by budget
    }
    if (type) {
      filter.title = { $regex: type, $options: "i" }; // case-insensitive search
    }
    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
      num: properties.length,
      totalPages,
      currentPage: parseInt(page),
      properties,
      totalProperties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getAProperty = async (req, res) => {
  const { propertyId } = req.params;
  try {
    const property = await PROPERTY.findById(propertyId).populate(
      "landlord",
      "fullName profiePicture email phoneNumber"
    );
    const moreFromLandlord = await PROPERTY.find({
      landlord: property.landlord._id,
      _id: { $ne: propertyId },
      availability: "available", // Only get available properties
      // Exclude the current property
    })
      .limit(3)
      .sort("-createdAt");
    const priceRange = property.price * 0.2;
    const simiarPropeerties = await PROPERTY.find({
      _id: { $ne: propertyId }, // Exclude the current property
      availability: "available",
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange,
      },
      location: property.location,
    })
      .limit(3)
      .sort("-createdAt");
    res.status(200).json({ property, moreFromLandlord, simiarPropeerties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
  deleteProperty,
};
