const Booking = require("../models/Booking");
const User = require("../models/User");

exports.getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const today = new Date().toDateString();
    const bookings = await Booking.find({ provider: providerId }).sort({ createdAt: -1 });

    const todayBookings = bookings.filter((booking) => new Date(booking.date).toDateString() === today);
    const pendingJobs = bookings.filter((booking) => booking.status === "Pending").length;
    const completedJobs = bookings.filter((booking) => booking.status === "Completed").length;
    const totalEarnings = bookings
      .filter((booking) => booking.status === "Completed")
      .reduce((sum, booking) => sum + (booking.agreedPrice || 0), 0);

    const currentMonth = new Date().getMonth();
    const monthlyBookings = new Array(12).fill(0);
    bookings.forEach((booking) => {
      monthlyBookings[new Date(booking.date).getMonth()] += 1;
    });

    const dailyEarnings = todayBookings
      .filter((booking) => booking.status === "Completed")
      .reduce((sum, booking) => sum + (booking.agreedPrice || 0), 0);

    const monthlyEarnings = bookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return (
          booking.status === "Completed" &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === new Date().getFullYear()
        );
      })
      .reduce((sum, booking) => sum + (booking.agreedPrice || 0), 0);

    res.json({
      stats: {
        todayBookings: todayBookings.length,
        pendingJobs,
        completedJobs,
        totalBookings: bookings.length,
        totalEarnings,
        dailyEarnings,
        monthlyEarnings,
        paymentStatus: completedJobs > 0 ? "Paid on completed jobs" : "No completed jobs yet"
      },
      analytics: {
        completed: completedJobs,
        pending: pendingJobs,
        monthlyBookings
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};

exports.getAdminSummary = async (req, res) => {
  try {
    const [customers, providers, bookings] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "provider" }),
      Booking.countDocuments()
    ]);

    const recentBookings = await Booking.find()
      .populate("customer", "name")
      .populate("provider", "name serviceCategory")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ counts: { customers, providers, bookings }, recentBookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin summary", error: error.message });
  }
};
