const Comment = require('../models/comment');
const Post = require('../models/post');

async function addComment(postId, commentData) {
  try {
    const [post, newComment] = await Promise.all([
      Post.findById(postId),
      Comment.create(commentData),
    ]);

    post.comments.push(newComment.toJSON());
    await post.save();
    return newComment;
  } catch (err) {
    throw new Error(err);
  }
}

async function likeComment(commentId, userId) {
  try {
    await Comment.updateOne({ _id: commentId }, { $push: { likes: userId } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { addComment, likeComment };
