const express = require('express');
const router = express.Router();
const passport = require('passport');
const authCheck = require('../utils/authCheck');

// auth with google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);

// callback route for google redirect
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/users/profile',
    failureRedirect: '/login',
  })
);

// auth with facebook
router.get('/facebook', passport.authenticate('facebook'));

// callback route for facebook redirect
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/users/profile',
    failureRedirect: '/login',
  })
);

router.get('/mock', passport.authenticate('mock'), authCheck, (req, res) => {
  res.status(200).json({ message: 'mock successful' });
});

module.exports = router;
