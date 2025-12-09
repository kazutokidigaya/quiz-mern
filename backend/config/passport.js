import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import cloudinary from "./cloudinary.js"; // Keeping this import for now

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://quiz-mern-dr93.vercel.app/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleID: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // --- Existing User Linking Path ---
            user.googleID = profile.id;
            if (!user.password) {
              user.isGoogleUser = true;
            }

            if (!user.profileUpdated) {
              // ACTION: Decoupled: Saving the raw Google URL instead of uploading to Cloudinary
              const googleImage = profile.photos[0]?.value;
              user.profileImage = googleImage || "/default-placeholder.png";
              user.name = profile.displayName;
              
              /* // --- CLOUDINARY UPLOAD (COMMENTED OUT TO PREVENT TIMEOUT) ---
              // try {
              //   const result = await cloudinary.uploader.upload(googleImage, {
              //     folder: "google-profile-images",
              //     public_id: `google_${profile.id}`,
              //   });
              //   user.profileImage = result.secure_url;
              // } catch (cloudinaryError) {
              //   console.error("Cloudinary Upload Error:", cloudinaryError);
              // }
              */
            }

            await user.save();
          } else {
            // --- New User Creation Path ---
            const googleImage = profile.photos[0]?.value;
            // ACTION: Decoupled: Saving the raw Google URL instead of uploading to Cloudinary
            const profileImageUrl = googleImage || "/default-placeholder.png";

            /*
            // --- CLOUDINARY UPLOAD (COMMENTED OUT TO PREVENT TIMEOUT) ---
            // let uploadedImage;
            // try {
            //   const result = await cloudinary.uploader.upload(googleImage, {
            //     folder: "google-profile-images",
            //     public_id: `google_${profile.id}`,
            //   });
            //   uploadedImage = result.secure_url;
            // } catch (cloudinaryError) {
            //   console.error("Cloudinary Upload Error:", cloudinaryError);
            //   uploadedImage = "/default-placeholder.png";
            // }
            */

            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleID: profile.id,
              isGoogleUser: true,
              isVerified: true,
              profileImage: profileImageUrl, // Using the raw Google URL
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
