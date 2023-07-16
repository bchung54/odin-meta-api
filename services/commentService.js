const mongoose = require('mongoose'); // needed for getComments
const Comment = require('../models/comment');
const Post = require('../models/post');
const { getPosts } = require('./postService');

async function addComment(postId, commentData) {
  try {
    const [post, newComment] = await Promise.all([
      Post.findById(postId),
      Comment.create(commentData),
    ]);

    post.comments.push(newComment._id);
    await post.save();
    return newComment;
  } catch (err) {
    throw new Error(err);
  }
}

async function getComments(commentIds) {
  try {
    const comments = await Comment.find({ _id: { $in: commentIds } });
    if (comments.length === 0) {
      throw new Error('No comment(s) found.');
    }
    return comments;
  } catch (err) {
    throw new Error(err);
  }
}

async function getCommentsByUser(userId) {
  try {
    const comments = await Comment.find({ user: userId });
    return comments;
  } catch (err) {
    throw new Error(err);
  }
}

async function likeComment(commentId, userId) {
  try {
    const comment = await Comment.findById(commentId);

    if (comment === null) {
      throw new Error('No comment(s) found.');
    }

    if (comment.likes.includes(userId)) {
      throw new Error('This comment has already been liked by this user.');
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: { likes: userId },
      },
      { new: true }
    );

    return updatedComment;
  } catch (err) {
    throw new Error(err);
  }
}

async function updateComment(commentId, newContent) {
  try {
    /* await Comment.updateOne(
      { _id: commentId },
      { $set: { content: newContent } }
    ); */
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { content: newContent } },
      { new: true }
    );

    if (updatedComment === null) {
      throw new Error('No comment found to update.');
    }

    return updatedComment;
  } catch (err) {
    throw new Error(err);
  }
}

async function deleteComment(commentId, postId) {
  try {
    await Comment.findByIdAndDelete(commentId);

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: commentId } },
      { new: true }
    );

    if (updatedPost === null) {
      throw new Error('No post modified.');
    }

    return updatedPost;
  } catch (err) {
    throw new Error(err);
  }
}

/* async function deleteCommentsByUser(userId) {
  try {
    const deleteManyReport = await Comment.deleteMany({ user: userId });
    if (deleteManyReport.deletedCount === 0) {
      throw new Error('No comment(s) deleted.');
    }
    return;
  } catch (err) {
    throw new Error(err);
  }
} */

module.exports = {
  addComment,
  getComments,
  getCommentsByUser,
  likeComment,
  updateComment,
  deleteComment,
  //deleteCommentsByUser,
};
