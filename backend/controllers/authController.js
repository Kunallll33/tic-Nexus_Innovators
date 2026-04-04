const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { SERVICE_CATEGORIES } = require("../config/constants");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    location: user.location,
    serviceCategory: user.serviceCategory,
    experience: user.experience,
    pricing: user.pricing,
    description: user.description,
    rating: user.rating
  };
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      city,
      location,
      serviceCategory,
      experience,
      pricing,
      description
    } = req.body;

    if (!name || !email || !phone || !password || !role || !city) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!["customer", "provider"].includes(role)) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    if (role === "provider" && serviceCategory && !SERVICE_CATEGORIES.includes(serviceCategory)) {
      return res.status(400).json({ message: "Invalid service category" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      city,
      location,
      serviceCategory: role === "provider" ? serviceCategory : "",
      experience: role === "provider" ? Number(experience) || 0 : 0,
      pricing: role === "provider" ? Number(pricing) || 0 : 0,
      description: role === "provider" ? description || "" : ""
    });

    res.status(201).json({
      message: "Registration successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

exports.getCategories = (req, res) => {
  res.json({ categories: SERVICE_CATEGORIES });
};
