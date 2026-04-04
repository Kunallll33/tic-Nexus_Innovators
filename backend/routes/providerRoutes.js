const express = require("express");
const providerController = require("../controllers/providerController");

const router = express.Router();

router.get("/", providerController.getProviders);
router.get("/:id", providerController.getProviderById);

module.exports = router;
