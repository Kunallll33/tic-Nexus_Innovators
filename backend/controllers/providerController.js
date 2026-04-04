const User = require("../models/User");

exports.getProviders = async (req, res) => {
  try {
    const { service, city } = req.query;
    const query = { role: "provider" };

    if (service) {
      query.serviceCategory = service;
    }

    if (city) {
      query.city = city;
    }

    const providers = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json({ providers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch providers", error: error.message });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: "provider" }).select("-password");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ provider });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch provider", error: error.message });
  }
};
