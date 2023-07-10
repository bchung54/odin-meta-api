const express = require('express');
const router = express.Router();
// Controllers
const userController = require('../controllers/userController');
// Models
const Post = require('../models/post');
// Utils
const authCheck = require('../utils/authCheck');

/* GET user profile and posts. */
/* router.get('/profile', authCheck, async (req, res, next) => {
  const posts = await Post.find({ user: res.locals.currentUser._id });
  res.render('profile', {
    title: `${req.user.username}'s Profile`,
    posts: posts,
  });
}); */

/* GET index: shows all potential friends*/
router.get('/', authCheck, userController.get_potential_friends);

/* GET user info */
router.get('/:userId', authCheck, userController.get_user_info);

/* GET all user posts */
router.get('/:userId/posts', authCheck, userController.get_user_posts);

/* GET user's timeline posts */
router.get('/:userId/timeline', authCheck, userController.get_timeline_posts);

/* GET all user comments */
router.get('/:userId/comments', authCheck, userController.get_user_comments);

/* POST new user post */
router.post('/:userId/posts', authCheck, userController.create_new_post);

/* PATCH user info */
router.patch('/:userId', authCheck, userController.update_username);

/* PATCH send friend request */
router.patch(
  '/:userId/sendFriend',
  authCheck,
  userController.send_friend_request
);

/* PATCH reject friend request */
router.patch(
  '/:userId/rejectFriend',
  authCheck,
  userController.reject_friend_request
);

/* PATCH accept friend request */
router.patch(
  '/:userId/acceptFriend',
  authCheck,
  userController.accept_friend_request
);

/* DELETE all user comments */
router.delete(
  '/:userId/comments',
  authCheck,
  userController.delete_user_comments
);

/* DELETE all user posts */
router.delete('/:userId/posts', authCheck, userController.delete_user_posts);

/* DELETE user */
router.delete('/:userId', authCheck, userController.delete_user);

module.exports = router;
