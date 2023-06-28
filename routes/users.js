const express = require('express');
const router = express.Router();
const Post = require('../models/post');

const authCheck = require('../utils/authCheck');

/* GET user profile and posts. */
router.get('/profile', authCheck, async (req, res, next) => {
  const posts = await Post.find({ user: res.locals.currentUser._id });
  res.render('profile', {
    title: `${req.user.username}'s Profile`,
    posts: posts,
  });
});

/* GET index: shows all potential friends*/
router.get('/', authCheck, userController.get_potential_friends);

/* GET user info */
router.get('/:userId', authCheck, userController.get_user_info);

/* GET all user posts */
router.get('/:userId/posts', authCheck, userController.get_user_posts);

/* GET all user comments */
router.get('/:userId/comments', authCheck, userController.get_user_comments);

/* POST new user post */
router.post('/:userId/posts', authCheck, userController.create_new_post);

/* PATCH user info */
router.patch('/:userId', authCheck, userController.update_user);

/* DELETE user */
router.delete('/:userId', authCheck, userController.delete_user);

/* DELETE all user posts */
router.delete('/:userId/posts', authCheck, userController.delete_user_posts);

/* DELETE all user comments */
router.delete(
  '/:userId/comments',
  authCheck,
  userController.delete_user_comments
);

module.exports = router;
