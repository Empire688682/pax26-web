import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, default:null},
    isPasswordSet: { type: Boolean, default:true},
    pin: { type: String, default: null},   
    bvn: { type: String, default: ""},   
    userVerify: { type: Boolean, default: false },
    verifyToken: {type:String, default:""},
    verifyTokenExpires : {type:Date},
    walletBalance: { type: Number, default: 0 },
    cashBackBalance: { type: Number, default: 0 },
    commissionBalance: { type: Number, default: 0 },
    profileImage: { type: String, default: "/profile-img.png" },
    isAdmin: {type: Boolean, default: false},
    number: { type: String, default: "", unique:true }, 
    referralCode: { type: String, default: "", unique:true }, 
    forgottenPasswordToken: { type: String, default: "" }, 
    referralHostId: { type: String , default: "" },
    provider: { type: String, default: "credentials" },
    bank: { type: String, default: "" },
    bankName: { type: String, default: "" },
    virtualAccount: { type: String, default: "" },
    providerId: { type: String, default: null }, 
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
export default UserModel;
