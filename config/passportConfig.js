const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/user');
const MockStrategy = require('passport-mock-strategy');
const { mockUserData, mockSecondUserData } = require('../seeds');

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
 * JWT Verification
 */

const jwtOpts = {};
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = process.env.JWT_PUBLIC_KEY;
jwtOpts.algorithms = ['RS256'];

const jwtVerify = async (token, done) => {
  try {
    return done(null, token.user);
  } catch (error) {
    done(error);
  }
};

passport.use('jwt', new JwtStrategy(jwtOpts, jwtVerify));

/**
 * Google Verification
 */

const googleOpts = {
  callbackURL: '/auth/google/callback',
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

/**
 * Facebook Verification
 */

const fbOpts = {
  callbackURL: '/auth/facebook/callback',
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  profileFields: ['id', 'displayName'],
};

const fbVerify = async (accessToken, refreshToken, profile, done) => {
  try {
    const currentUser = await User.findOne({ facebookId: profile.id });
    if (currentUser) {
      return done(null, currentUser);
    } else {
      const newUser = await User.create({
        username: profile.displayName,
        facebookId: profile.id,
        picture: `https://graph.facebook.com/me/picture?access_token=${accessToken}&&redirect=false`,
      });
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
};

passport.use('facebook', new FacebookStrategy(fbOpts, fbVerify));

/**
 * Mock Strategy
 */

const mockOpts = {
  user: mockUserData,
};

const mockVerify = async (user, done) => {
  try {
    const currentUser = await User.findOne({ username: user.username });
    if (currentUser) {
      return done(null, currentUser);
    } else {
      const newUser = await User.create(user);
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
};

passport.use('mock', new MockStrategy(mockOpts, mockVerify));

const mockOpts2 = {
  user: mockSecondUserData,
};

const mockVerify2 = async (user, done) => {
  try {
    const currentUser = await User.findOne({ username: user.username });
    if (currentUser) {
      return done(null, currentUser);
    } else {
      const newUser = await User.create(user);
      return done(null, newUser);
    }
  } catch (err) {
    return done(err);
  }
};

passport.use('mock2', new MockStrategy(mockOpts2, mockVerify2));
