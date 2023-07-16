const Post = require('../models/post');
const { getUsers } = require('./userService');

async function createPost(postData) {
  try {
    const post = await Post.create(postData);
    return post;
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
    const posts = await Post.find({ _id: { $in: postIds } });
    if (posts.length === 0) {
      throw new Error('No post(s) found.');
    }
    return posts;
  } catch (err) {
    throw new Error(err);
  }
}

async function getPostsByUsers(userIds) {
  try {
    await getUsers(userIds);
    return await Post.find({ user: { $in: userIds } });
  } catch (err) {
    throw new Error(err.message);
  }
}

async function likePost(postId, userId) {
  try {
    const [post] = await getPosts([postId]);
    if (post.likes.includes(userId)) {
      throw new Error('This post has already been liked by this user.');
    }
    await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function updatePost(postId, updatedContent) {
  try {
    await Post.updateOne(
      { _id: postId },
      { $set: { content: updatedContent } }
    );
    const [updatedPost] = await getPosts([postId]);
    return updatedPost;
  } catch (err) {
    throw new Error(err);
  }
}

async function deletePosts(postIds) {
  try {
    const deleteManyResult = await Post.deleteMany({ _id: { $in: postIds } });
    if (deleteManyResult.deletedCount === 0) {
      throw new Error('No post(s) deleted.');
    }
    return;
  } catch (err) {
    throw new Error(err);
  }
}

/* async function deletePostsByUser(userId) {
  try {
    const deleteManyResult = await Post.deleteMany({ user: userId });
    if (deleteManyResult.deletedCount === 0) {
      throw new Error('No post(s) deleted.');
    }
    return;
  } catch (err) {
    throw new Error(err);
  }
} */

module.exports = {
  createPost,
  getPosts,
  getPostsByUsers,
  likePost,
  updatePost,
  deletePosts,
  // deletePostsByUser,
};
