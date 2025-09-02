import User from "../models/userModel.js";
import admin from "../config/firebase.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // 🔹 Fetch user role from MongoDB
    const user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) return res.status(403).json({ error: "User not registered in DB" });

    req.user = {
      firebaseUid: decoded.uid,
      email: decoded.email,
      role: user.role, // ✅ Add role here
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
};
