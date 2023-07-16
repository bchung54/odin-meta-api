const mongoose = require('mongoose');
const { createUser } = require('../userService');
const {
  createPost,
  likePost,
  getPosts,
  getPostsByUsers,
  updatePost,
  deletePosts,
  deletePostsByUser,
} = require('../postService');
// models
const Post = require('../../models/post');
const User = require('../../models/user');
// database
const db = require('../../config/mongoConfigTesting');
const Seed = require('../../seeds');

beforeAll(async () => {
  await db.initializeMongoServer();
});

afterEach(async () => {
  await db.dropCollections();
});

afterAll(async () => {
  await db.dropDatabase();
});

describe('Post service', () => {
  describe('given valid user and valid post data', () => {
    const validUserData = Seed.usersData[0];
    const validPostData = Seed.postsData[0];
    let validUser;

    beforeEach(async () => {
      validUser = await createUser(validUserData);
    });

    describe('createPost', () => {
      it('should create new post in db', async () => {
        // create post
        const newPost = await createPost(validPostData);

        // check properties
        expect(mongoose.isValidObjectId(newPost._id)).toBe(true);
        expect(newPost.user).toEqual(
          new mongoose.Types.ObjectId(validUser._id)
        );
        expect(newPost.content).toBe(validPostData.content);
        expect(Array.isArray(newPost.comments)).toBe(true);
        expect(Array.isArray(newPost.likes)).toBe(true);
        expect(newPost.createdAt).toBeInstanceOf(Date);
        // check virtuals
        expect(newPost.url).toBe(`/post/${newPost._id}`);
      });
    });

    describe('likePost', () => {
      let newPost;
      beforeEach(async () => {
        newPost = await createPost(validPostData);
      });

      it('should like a new post', async () => {
        // like post and then retrieve liked post
        await likePost(newPost._id, validUser._id);
        const likedPost = await Post.findById(newPost._id);

        expect(likedPost.likes.length).toBe(1);
        expect(likedPost.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });

      it('should only like a post once maximum', async () => {
        // like post
        await likePost(newPost._id, validUser._id);
        // like post a second time with same user
        await expect(likePost(newPost._id, validUser._id)).rejects.toThrow(
          'This post has already been liked by this user.'
        );
        // retrieve liked post
        const likedPost = await Post.findById(newPost._id);

        expect(likedPost.likes.length).toBe(1);
        expect(likedPost.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });
    });
  });

  describe('given a group of users with a post each and a friend trio', () => {
    beforeEach(async () => {
      await User.insertMany(Seed.usersData);
      await Post.insertMany(Seed.postsData);
    });

    describe('getPosts', () => {
      it('should get all posts when there are no inputs', async () => {
        const retrievedPosts = await getPosts();
        expect(retrievedPosts.length).toBe(Seed.NUM_OF_USERS);
      });

      it('should throw error when no posts found', async () => {
        // random ObjectId
        const postId = new mongoose.Types.ObjectId();

        await expect(getPosts([postId])).rejects.toThrow('No post(s) found.');
      });

      it('should get two posts', async () => {
        const retrievedPosts = await getPosts([
          Seed.postsData[0]._id,
          Seed.postsData[1]._id,
        ]);

        expect(retrievedPosts.length).toBe(2);
      });
    });
    describe('getPostsByUsers', () => {
      it('should get two posts by two users', async () => {
        const userPost = await getPostsByUsers([
          Seed.usersData[0]._id,
          Seed.usersData[1]._id,
        ]);

        expect(userPost.length).toBe(2);
      });

      it('should throw error when no posts found for a user', async () => {
        // random ObjectId
        const userId = new mongoose.Types.ObjectId();

        await expect(getPostsByUsers([userId])).rejects.toThrow(
          'Error: No user(s) found.'
        );
      });
    });

    describe('updatePost', () => {
      it('should update post with new content', async () => {
        // update post and then retrieve updated post
        const updatedPost = await updatePost(
          Seed.postsData[2]._id,
          'updated post content'
        );

        expect(updatedPost.content).toBe('updated post content');
      });
    });

    describe('deletePosts', () => {
      it('should delete post and throw error when trying to retrieve it', async () => {
        await deletePosts([Seed.postsData[2]._id]);
        await expect(getPosts([Seed.postsData[2]._id])).rejects.toThrow(
          'No post(s) found.'
        );
      });

      it('should throw error when no post deleted', async () => {
        // random ObjectId
        const postId = new mongoose.Types.ObjectId();

        await expect(deletePosts([postId])).rejects.toThrow(
          'No post(s) deleted.'
        );
      });
    });

    describe('deletePostsByUser', () => {
      it('should delete posts from user and throw error when trying to retrieve it', async () => {
        await deletePostsByUser([Seed.usersData[2]._id]);
        const postsRemaining = await getPostsByUsers([Seed.usersData[2]._id]);
        expect(postsRemaining).toEqual([]);
      });

      it('should throw error when user not found', async () => {
        // random ObjectId
        const userId = new mongoose.Types.ObjectId();

        await expect(deletePostsByUser([userId])).rejects.toThrow(
          'Error: No post(s) deleted.'
        );
      });
    });
  });
});
