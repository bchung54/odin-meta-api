const mongoose = require('mongoose');
const { createUser } = require('../userService');
const {
  createPost,
  likePost,
  getPosts,
  getPostsByUsers,
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
        // like post
        await likePost(newPost._id, validUser._id);

        // retrieve liked post
        const likedPost = await Post.findById(newPost._id);

        // check liked post properties
        expect(likedPost.likes.length).toBe(1);
        expect(likedPost.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });

      it('should only like a post once maximum', async () => {
        // like post
        await likePost(newPost._id, validUser._id);

        // like post a second time with same user
        await likePost(newPost._id, validUser._id);

        // retrieve liked post
        const likedPost = await Post.findById(newPost._id);

        // check liked post properties
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

      it('should get no posts', async () => {
        const retrievedPosts = await getPosts([]);
        expect(retrievedPosts.length).toBe(0);
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
    });
  });
});
