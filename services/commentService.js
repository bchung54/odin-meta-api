const mongoose = require('mongoose'); // needed for getComments
const Comment = require('../models/comment');
const Post = require('../models/post');

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

async function likeComment(commentId, userId) {
  try {
    const comment = await Comment.findById(commentId);
    if (comment.likes.includes(userId)) {
      return;
    }
    await Comment.updateOne({ _id: commentId }, { $push: { likes: userId } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function getComments(commentIds) {
  try {
    if (commentIds.length === 0) {
      return [];
    }
    const comments = await Comment.find({ _id: { $in: commentIds } });
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

async function deleteComments(commentIds) {
  try {
    await Comment.deleteMany({ _id: { $in: commentIds } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function deleteCommentsByUser(userId) {
  try {
    await Comment.deleteMany({ user: userId });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  addComment,
  likeComment,
  getComments,
  getCommentsByUser,
  deleteComments,
  deleteCommentsByUser,
};
