import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { google } from 'googleapis';

// Load environment variables
dotenv.config();

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const SCOPES = [
  'profile',
  'email',
  'https://www.googleapis.com/auth/calendar.readonly'
];

// Passport serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// OAuth 2.0 client
export const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: SCOPES,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
            tokens: {
              accessToken,
              refreshToken,
              tokenExpiry: new Date(Date.now() + 3600 * 1000) // 1 hour
            },
            calendarEnabled: true
          });
        } else {
          // Update user's tokens
          user.tokens.accessToken = accessToken;
          user.tokens.refreshToken = refreshToken;
          user.tokens.tokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour
          user.calendarEnabled = true;
          user.lastLogin = Date.now();
          await user.save();
        }

        // Set up oauth2Client with user's tokens for future API calls
        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;