const {
  getPosts,
  createPost,
  updatePost,
  deletePosts,
} = require('../services/postService');
const {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} = require('../services/commentService');
const { body, validationResult } = require('express-validator');

// GET '/api/posts'
exports.get_timeline_posts = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: get_timeline_posts');
};

// POST '/api/posts'
exports.create_new_post = [
  body('content').notEmpty().withMessage('Content is missing.').trim().escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      const postData = {
        user: req.user._id,
        content: req.body.content,
      };
      const newPost = await createPost(postData);

      return res.status(201).json(newPost.toJSON());
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// GET '/api/posts/:postId'
exports.get_post_info = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);

    return res.status(200).json(post.toJSON());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST '/api/posts/:postId/comments'
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
      await getPosts([req.params.postId]);
      const newCommentData = { user: req.user._id, content: req.body.content };
      const newComment = await addComment(req.params.postId, newCommentData);

      return res.status(201).json(newComment.toJSON());
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// GET '/api/posts/:postId/comments'
exports.get_post_comments = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);
    const comments = await getComments(post.comments);

    return res.status(200).json({ comments: comments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH '/api/posts/:postId'
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
      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: `Only the post author is allowed to update post. Post.user (${post.user.toString()}), req.user.id(${req.user._id.toString()})`,
        });
      }
      const updatedPost = await updatePost(
        req.params.postId,
        req.body.updatedContent
      );

      return res.status(200).json(updatedPost);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// PATCH '/api/posts/:postId/comments/:commentId'
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
      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'Only the comment author is allowed to update comment.',
        });
      }
      const updatedComment = await updateComment(
        req.params.commentId,
        req.body.updatedContent
      );

      return res.status(200).json(updatedComment);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

// DELETE '/api/posts/:postId/comments/:commentId
exports.delete_comment = async (req, res, next) => {
  try {
    const [comment] = await getComments([req.params.commentId]);
    if (comment === null) {
      throw new Error('No comment found.');
    }
    await getPosts([req.params.postId]);
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the comment author is allowed to delete comment.',
      });
    }
    await deleteComment(req.params.commentId, req.params.postId);

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE '/api/posts/:postId'
exports.delete_post = async (req, res, next) => {
  try {
    const [post] = await getPosts([req.params.postId]);
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the post author is allowed to delete post.',
      });
    }
    await deletePosts([req.params.postId]);

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE '/api/posts/:postId/comments
/* exports.delete_post_comments = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: delete_post_comments');
};
 */
