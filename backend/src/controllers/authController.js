import admin from "../config/firebase.js";
import User from "../models/userModel.js";

// Login controller
export const loginUser = async (req, res) => {
  try {
    const { firebaseUid, email } = req.body;

    // 🔹 Find user in MongoDB
    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ error: "User not registered in DB" });
    }

    // 🔹 Send back role + email + firebaseUid
    res.json({
      firebaseUid: user.firebaseUid,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-__v"); // exclude __v
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// 🔹 Add new user (Admin only)
export const addUser = async (req, res) => {
  try {
    const { firebaseUid, email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const user = await User.create({ firebaseUid, email, role });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};
