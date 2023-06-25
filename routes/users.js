const express = require('express');
const router = express.Router();
const Post = require('../models/post');

const authCheck = require('../utils/authCheck');

/* GET users listing. */
router.get('/profile', authCheck, async (req, res, next) => {
  const posts = await Post.find({ user: res.locals.currentUser._id }).exec();
  res.render('profile', {
    title: `${req.user.username}'s Profile`,
    posts: posts,
  });
});

module.exports = router;
