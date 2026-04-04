const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "provider", "admin"], required: true },
    city: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    serviceCategory: { type: String, default: "" },
    experience: { type: Number, default: 0 },
    pricing: { type: Number, default: 0 },
    description: { type: String, default: "" },
    rating: { type: Number, default: 4.5 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
