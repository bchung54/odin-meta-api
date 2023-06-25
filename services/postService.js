const Post = require('../models/post');

async function createPost(postData) {
  try {
    const post = await Post.create(postData);
    return post;
  } catch (err) {
    throw new Error(err);
  }
}

async function likePost(postId, userId) {
  try {
    await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { createPost, likePost };
