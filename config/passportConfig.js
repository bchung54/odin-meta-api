const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');

const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

/**
 * Google Verification
 */

const googleOpts = {
  callbackURL: '/auth/google/redirect',
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

const googleVerify = async (accessToken, refreshToken, profile, done) => {
  try {
    const currentUser = await User.findOne({ googleId: profile.id });
    if (currentUser) {
      return done(null, currentUser);
    } else {
      const newUser = await User.create({
        username: profile.displayName,
        googleId: profile.id,
        picture: profile.picture,
      });
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
};

passport.use('google', new GoogleStrategy(googleOpts, googleVerify));
