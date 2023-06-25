const express = require('express');
const router = express.Router();
const passport = require('passport');

// auth with google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  })
);

// callback route for google redirect
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('/users/profile');
});

module.exports = router;
