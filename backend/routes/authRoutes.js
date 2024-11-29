import express from "express";
import passport from "passport";
import {
  sendVerificationOTP,
  verifyOTPAndSignup,
  updateProfile,
  loginUser,
  getUserDetails,
  logOutUser,
  fetchUserToken,
} from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import redis from "../config/redisclient.js";

const router = express.Router();

// google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Store the token in Redis with the user's ID as the key
      await redis.set(req.user._id.toString(), token, "EX", 7200);

      // Redirect to the frontend with the user ID
      res.redirect(
        `http://localhost:3000/google/callback?userId=${req.user._id}`
      );
    } catch (error) {
      console.error("Error during Google OAuth callback:", error);
      res.status(500).json({ message: "Failed to authenticate user." });
    }
  }
);

//login
router.post("/login", loginUser);

// normal signup
router.post("/send-code", sendVerificationOTP);
router.post("/signup", verifyOTPAndSignup);

// change password while logged in
router.post("/update-profile", authMiddleware, updateProfile);

router.get("/user-details", authMiddleware, getUserDetails);

router.get("/logout", authMiddleware, logOutUser);

router.get("/fetch-token/:userId", fetchUserToken);

export default router;
