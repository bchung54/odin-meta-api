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
    const post = await Post.findById(postId);
    if (post.likes.includes(userId)) {
      return;
    }
    await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function getPosts(postIds) {
  try {
    if (!postIds) {
      const posts = await Post.find({});
      return posts;
    }
    if (postIds.length === 0) {
      return [];
    }
    const posts = await Post.find({ _id: { $in: postIds } });
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

async function getPostsByUsers(userIds) {
  try {
    if (!userIds) {
      const posts = await Post.find({});
      return posts;
    }
    if (userIds.length === 0) {
      return [];
    }
    const posts = await Post.find({ user: { $in: userIds } });
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

async function deletePosts(postIds) {
  try {
    await Post.deleteMany({ _id: { $in: postIds } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function deletePostsByUser(userId) {
  try {
    await Post.deleteMany({ user: userId });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createPost,
  likePost,
  getPosts,
  getPostsByUsers,
  deletePosts,
  deletePostsByUser,
};
