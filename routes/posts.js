const express = require('express');
const router = express.Router();

const authCheck = require('../utils/authCheck');

/* GET index: shows all recent posts ("Timeline" feature) */
router.get('/', authCheck, postController.get_timeline_posts);

/* GET post info */
router.get('/:postId', authCheck, postController.get_post_info);

/* GET all post comments */
router.get('/:postId/comments', authCheck, postController.get_post_comments);

/* POST new comment */
router.post('/:postId/comments', authCheck, postController.create_new_comment);

/* PATCH post info */
router.patch('/:postId', authCheck, postController.update_post);

/* PATCH post comment */
router.patch(
  '/:postId/comments/:commentId',
  authCheck,
  postController.update_comment
);

/* DELETE post */
router.delete('/:postId', authCheck, postController.delete_post);

/* DELETE post comment */
router.delete(
  '/:postId/comments/:commentId',
  authCheck,
  postController.delete_comment
);

/* DELETE all post comments */
router.delete(
  '/:postId/comments',
  authCheck,
  postController.delete_post_comments
);

module.exports = router;
