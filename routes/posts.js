const express = require('express');
const router = express.Router();
// Controllers
const postController = require('../controllers/postController');
// Utils
const authCheck = require('../utils/authCheck');

/* GET index: shows all recent posts ("Timeline" feature) */
router.get('/', authCheck, postController.get_timeline_posts);

/* POST new user post */
router.post('/', authCheck, postController.create_new_post);

/* GET post info */
router.get('/:postId', authCheck, postController.get_post_info);

/* PATCH post info */
router.patch('/:postId', authCheck, postController.update_post);

/* DELETE post */
router.delete('/:postId', authCheck, postController.delete_post);

/* GET all post comments */
router.get('/:postId/comments', authCheck, postController.get_post_comments);

/* POST new comment */
router.post('/:postId/comments', authCheck, postController.create_new_comment);

/* PATCH post comment */
router.patch(
  '/:postId/comments/:commentId',
  authCheck,
  postController.update_comment
);

/* DELETE post comment */
router.delete(
  '/:postId/comments/:commentId',
  authCheck,
  postController.delete_comment
);

/* DELETE all post comments */
/* router.delete(
  '/:postId/comments',
  authCheck,
  postController.delete_post
); */

module.exports = router;
