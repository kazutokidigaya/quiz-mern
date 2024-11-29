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

connectDb();
const app = express();
app.use(cors());

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//Auth routes
app.use("/api/auth", authRoutes);

// Quiz routes
app.use("/api/quiz", quizRoutes);

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`server is running on- http://localhost:${PORT}`)
  );
}
