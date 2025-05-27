const PROPERTY = require("../models/property");

const createProperty = async (req, res) => {
  res.send("create property");
};

const getLandlordsProperties = async (req, res) => {
  res.send("get landlords property");
};

const updatePropertyAvailability = async (req, res) => {
  res.send("update property availability");
};

const getAllProperties = async (req, res) => {
  res.send("get all properties");
};

const getAProperty = async (req, res) => {
  res.send("get a property");
};

module.exports = {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
};
