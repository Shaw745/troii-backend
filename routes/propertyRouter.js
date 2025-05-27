const router = require("express").Router();

const {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
} = require("../controllers/propertyController");

const { isLoggedIn, requirePermissions } = require("../middleware/auth");

router.post(
  "/property",
  isLoggedIn,
  requirePermissions("landlord"),
  createProperty
);

router.get(
  "/property/landlord",
  isLoggedIn,
  requirePermissions("landlord"),
  getLandlordsProperties
);

router.patch(
  "/property/landlord/:propertyId",
  isLoggedIn,
  requirePermissions("landlord"),
  updatePropertyAvailability
);

//tenants
router.get("/property", isLoggedIn, getAllProperties);
router.get("/property/:propertyId", isLoggedIn, getAProperty);

module.exports = router;
