import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import cloudinary from "./cloudinary.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Fixed typo here
      callbackURL:
        "https://quiz-mern-rs1j.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleID: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleID = profile.id;
            if (!user.password) {
              user.isGoogleUser = true; // Keep this only for users without a password
            }

            if (!user.profileUpdated) {
              const googleImage = profile.photos[0]?.value;

              // Upload Google profile image to Cloudinary
              try {
                const result = await cloudinary.uploader.upload(googleImage, {
                  folder: "google-profile-images",
                  public_id: `google_${profile.id}`,
                });
                user.profileImage = result.secure_url;
              } catch (cloudinaryError) {
                console.error("Cloudinary Upload Error:", cloudinaryError);
              }

              user.name = profile.displayName;
            }

            await user.save();
          } else {
            const googleImage = profile.photos[0]?.value;

            let uploadedImage;
            try {
              const result = await cloudinary.uploader.upload(googleImage, {
                folder: "google-profile-images",
                public_id: `google_${profile.id}`,
              });
              uploadedImage = result.secure_url;
            } catch (cloudinaryError) {
              console.error("Cloudinary Upload Error:", cloudinaryError);
              uploadedImage = "/default-placeholder.png"; // Fallback in case of an error
            }

            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleID: profile.id,
              isGoogleUser: true,
              isVerified: true,
              profileImage: uploadedImage,
            });
          }
        }

        return done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
