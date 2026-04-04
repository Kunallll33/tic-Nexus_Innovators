const bcrypt = require("bcryptjs");
const Booking = require("../models/Booking");
const User = require("../models/User");

exports.createBooking = async (req, res) => {
  try {
    const { customerId, providerId, serviceName, date, time, address } = req.body;

    if (!customerId || !providerId || !serviceName || !date || !time || !address) {
      return res.status(400).json({ message: "Please fill all booking fields" });
    }

    const [customer, provider] = await Promise.all([User.findById(customerId), User.findById(providerId)]);

    if (!customer || customer.role !== "customer") {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Provider not found" });
    }

    // City matching is the core marketplace rule for Homigo.
    if (customer.city !== provider.city) {
      return res.status(400).json({ message: "Provider is not available in your city" });
    }

    const booking = await Booking.create({
      serviceName,
      customer: customerId,
      provider: providerId,
      date,
      time,
      address,
      agreedPrice: provider.pricing || 0
    });

    const populatedBooking = await booking.populate([
      { path: "customer", select: "name city email phone" },
      { path: "provider", select: "name city serviceCategory pricing" }
    ]);

    res.status(201).json({ message: "Booking created successfully", booking: populatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Failed to create booking", error: error.message });
  }
};

exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.params.customerId })
      .populate("provider", "name serviceCategory city pricing")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error: error.message });
  }
};

exports.getProviderBookings = async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    const providerId = req.params.providerId;
    const now = new Date();

    const bookings = await Booking.find({ provider: providerId })
      .populate("customer", "name city email phone")
      .sort({ createdAt: -1 });

    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      if (filter === "today") {
        return bookingDate.toDateString() === now.toDateString();
      }
      if (filter === "weekly") {
        const diff = now - bookingDate;
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      if (filter === "monthly") {
        return bookingDate.getMonth() === now.getMonth() && bookingDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    res.json({ bookings: filteredBookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch provider bookings", error: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Accepted", "Completed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status, paymentStatus: status === "Completed" ? "Paid" : "Unpaid" },
      { new: true }
    )
      .populate("customer", "name city")
      .populate("provider", "name serviceCategory");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, city, location } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, role: "customer" },
      { name, phone, city, location },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

exports.updateProviderProfile = async (req, res) => {
  try {
    const { name, phone, city, location, serviceCategory, experience, pricing, description } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, role: "provider" },
      { name, phone, city, location, serviceCategory, experience, pricing, description },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update provider profile", error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};
