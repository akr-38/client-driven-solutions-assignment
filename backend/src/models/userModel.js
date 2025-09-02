import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
});

const User = mongoose.model("User", userSchema);

export default User;
