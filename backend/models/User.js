import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      require: [true, "Email is required"],
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      minlength: [6, "Password should be 6 characters long"],
    },
    profileImage: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
    },
    profileUpdated: { type: Boolean, default: false },
    googleID: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiration: { type: Date },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
