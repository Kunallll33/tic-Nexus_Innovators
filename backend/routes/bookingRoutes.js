const express = require("express");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.post("/", bookingController.createBooking);
router.get("/customer/:customerId", bookingController.getCustomerBookings);
router.get("/provider/:providerId", bookingController.getProviderBookings);
router.patch("/:bookingId/status", bookingController.updateBookingStatus);
router.put("/customer/:userId/profile", bookingController.updateCustomerProfile);
router.put("/provider/:userId/profile", bookingController.updateProviderProfile);
router.patch("/user/:userId/password", bookingController.changePassword);

module.exports = router;
