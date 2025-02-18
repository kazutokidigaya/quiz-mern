import express from "express";
import passport from "passport";
import session from "express-session";
import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import connectDb from "./config/db.js";
import cors from "cors";

config();

import "./config/passport.js";

// Connect to the database
connectDb();

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is up and running!" });
});

export { app };
