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

// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Add a basic health check route for Render
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is up and running!" });
});

// Start the server
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0"; // Bind to all interfaces for Render
  const server = app.listen(PORT, HOST, () =>
    console.log(`Server is running on port ${PORT}`)
  );

  // Set custom timeouts to avoid Render connection resets
  server.keepAliveTimeout = 120000; // 2 minutes
  server.headersTimeout = 120000; // 2 minutes
}

export { app };
