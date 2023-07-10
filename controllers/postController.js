const {
  getPosts,
  updatePost,
  deletePosts,
} = require('../services/postService');
const {
  addComment,
  getComments,
  deleteComments,
} = require('../services/commentService');
const { body, validationResult } = require('express-validator');

// GET '/api/:postId'
exports.get_post_info = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);

    return res.status(200).json({ post: post.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET '/api/:postId/comments'
exports.get_post_comments = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);

    return res.status(200).json({ post: post.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST '/api/:postId/comments'
exports.create_new_comment = [
  body('content').notEmpty().withMessage('Content is missing.').trim().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      const newCommentData = { user: req.user._id, content: req.body.content };
      const newComment = await addComment(req.params.postId, newCommentData);

      return res.status(200).json({ comment: newComment.toJSON() });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// PATCH '/api/:postId'
exports.update_post = [
  body('updatedContent')
    .notEmpty()
    .withMessage('Content is missing.')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      const [post] = await getPosts([req.params.postId]);
      if (post.user !== req.user._id) {
        return res
          .status(403)
          .json({ message: 'Only the post author is allowed to update post.' });
      }
      await updatePost(req.params.postId, updatedContent);

      return res.status(204);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// PATCH '/api/:postId/comments/:commentId'
exports.update_comment = [
  body('updatedContent')
    .notEmpty()
    .withMessage('Content is missing.')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      const [comment] = await getComments([req.params.commentId]);
      if (comment.user !== req.user._id) {
        return res
          .status(403)
          .json({ message: 'Only the post author is allowed to update post.' });
      }
      await updatePost(req.params.commentId, updatedContent);

      return res.status(204);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// DELETE '/api/:postId/comments/:commentId
exports.delete_comment = async (req, res, next) => {
  try {
    const [comment] = await getComments([req.params.commentId]);
    if (comment.user !== req.user._id) {
      return res.status(403).json({
        message: 'Only the comment author is allowed to delete comment.',
      });
    }
    await deleteComments([req.params.commentId]);

    return res.status(204);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE '/api/:postId'
exports.delete_post = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);
    if (post.user !== req.user._id) {
      return res.status(403).json({
        message: 'Only the post author is allowed to delete post.',
      });
    }
    await deletePosts([req.params.postId]);

    return res.status(204);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE '/api/:postId/comments
exports.delete_post_comments = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: delete_post_comments');
};
