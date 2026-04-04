const express = require("express");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/provider/:providerId", dashboardController.getProviderDashboard);
router.get("/admin/summary", dashboardController.getAdminSummary);

module.exports = router;
