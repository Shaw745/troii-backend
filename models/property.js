const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    bedroom: {
      type: Number,
      required: true,
    },
    livingRoom: {
      type: Number,
      required: true,
    },

    kitchens: {
      type: Number,
      required: true,
      min: 0,
    },
    toilets: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentPeriod: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
    },
    images: [String],
    availability: {
      type: String,
      enum: ["rented", "available"],
      default: "available",
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const PROPERTY = mongoose.model("property", propertySchema);
module.exports = PROPERTY;
