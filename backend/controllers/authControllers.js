import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redis from "../config/redisClient.js";
import cloudinary from "../config/cloudinary.js";

const otpStore = {};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please sign up" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "User is not verified. Please verify your email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await redis.set(user._id.toString(), token, "EX", 7200);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login Failed. Please Try again later." });
  }
};

const logOutUser = async (req, res) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(400).json({ message: "No token provided for logout." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res
      .status(400)
      .json({ message: "Token not found in Authorization header." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await redis.del(userId);

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Session expired. Please log in again." });
    }
    console.error("Error in logOutUser:", error);
    res.status(500).json({ message: "Failed to log out." });
  }
};

const sendVerificationOTP = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please log in." });
    }

    // Generate the OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store the OTP with expiration in memory
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    // Send email with the OTP
    const response = await sendEmail(
      email,
      "Verify Your Email",
      `Your Registration code for Quiz-Ez is: ${otp}` // Use `otp` instead of `verificationCode`
    );

    if (!response) {
      console.log("Error sending mail:", response);
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.status(200).json({ message: "Verification code sent", otp });
  } catch (error) {
    console.error("Error in sendVerificationOTP:", error); // Log the error for debugging
    res.status(500).json({ message: "Failed to send email" });
  }
};

const verifyOTPAndSignup = async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    const storedOtp = otpStore[email];

    if (!storedOtp) {
      console.log("No OTP found for this email.");
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (storedOtp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please log in." });
    }

    const newUser = new User({
      name,
      email,
      password,
      isVerified: true,
      profileImage:
        "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await redis.set(newUser._id.toString(), token, "EX", 7200);

    delete otpStore[email]; // Remove OTP after successful signup

    res.status(200).json({ message: "Signup successful!", token });
  } catch (error) {
    console.error("Error in verifyOTPAndSignup:", error);
    res
      .status(500)
      .json({ message: "Failed to verify OTP or complete signup." });
  }
};

const updateProfile = async (req, res) => {
  const { email, oldPassword, newPassword, name, profileImage } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password if provided
    if (newPassword) {
      if (user.password) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Old password is incorrect." });
        }
      }
      user.password = newPassword;
      user.isGoogleUser = false; // Mark as non-Google user if password is updated
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Update profile image
    if (profileImage) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: "quiz-mern-profile-pics",
          public_id: `profile_${user._id}`,
        });
        user.profileImage = result.secure_url;
        user.profileUpdated = true;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res
          .status(500)
          .json({ message: "Failed to upload profile image." });
      }
    }

    await user.save();

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const tokenFromHeader = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(tokenFromHeader, process.env.JWT_SECRET);

    const redisToken = await redis.get(decoded.id);
    if (redisToken !== tokenFromHeader) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await User.findById(req.user.id); // Assuming `req.user` contains the authenticated user's info
    if (!user) {
      console.log("User not found in the database");

      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      id: user._id,
      isGoogleUser: user.isGoogleUser,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Error in getUserDetails:", error);

    res.status(500).json({ message: "Failed to fetch user details." });
  }
};

const fetchUserToken = async (req, res) => {
  const { userId } = req.params;

  try {
    const token = await redis.get(userId);

    if (!token) {
      return res.status(404).json({ message: "Token not found or expired." });
    }

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error fetching token from Redis:", error);
    res.status(500).json({ message: "Failed to fetch token." });
  }
};

export {
  sendVerificationOTP,
  verifyOTPAndSignup,
  updateProfile,
  loginUser,
  getUserDetails,
  logOutUser,
  fetchUserToken,
};
