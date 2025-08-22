import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, default:"not set"},
    pin: { type: String, default: "1234"},   
    bvnVerify: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },
    profileImage: { type: String, default: "" },
    isAdmin: {type: Boolean, default: false},
    number: { type: String, default: "" }, 
    forgottenPasswordToken: { type: String, default: "" }, 
    referralHost: { type: String , default: "" }, // Add this for referrals
    provider: { type: String, default: "credentials" },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
