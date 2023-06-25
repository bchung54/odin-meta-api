const mongoose = require('mongoose');
const {
  createUser,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
} = require('../userService');
const { createPost, likePost } = require('../postService');
const { addComment, likeComment } = require('../commentService');
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
const db = require('../../config/mongoConfigTesting');

beforeAll(async () => {
  await db.initializeMongoServer();
});

afterEach(async () => {
  await db.dropCollections();
});

afterAll(async () => {
  await db.dropDatabase();
});

/**
 * User Service
 */
describe('User service', () => {
  describe('Given valid user data: username', () => {
    const validUserData = { username: 'userone' };

    it('should create user with correct properties in db', async () => {
      const validUser = await createUser(validUserData);

      // check properties
      expect(mongoose.isValidObjectId(validUser._id)).toBe(true);
      expect(validUser).toMatchObject({ username: 'userone', friends: [] });

      // check virtuals
      expect(validUser.url).toBe(`/user/${validUser.username}`);
    });
  });

  describe('Given user data without required field: username', () => {
    const invalidUserData = { nickname: 'nickname' };

    it('should fail to create user', async () => {
      let err;
      try {
        await createUser(invalidUserData);
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('Given two valid users', () => {
    let sender, receiver;
    beforeEach(async () => {
      sender = await createUser({ username: 'sender' });
      receiver = await createUser({ username: 'receiver' });
    });

    it('should send friend request', async () => {
      await sendFriendRequest(sender._id, receiver._id);

      const [updatedSender, updatedReceiver] = await Promise.all([
        User.findById(sender._id),
        User.findById(receiver._id),
      ]);

      expect(updatedSender.friends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: receiver._id, status: 0 }),
        ])
      );
      expect(updatedReceiver.friends).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: sender._id, status: 1 }),
        ])
      );
    });

    it('should send and reject friend request', async () => {
      await sendFriendRequest(sender._id, receiver._id);
      await rejectFriendRequest(receiver._id, sender._id);

      const [updatedSender, updatedReceiver] = await Promise.all([
        User.findById(sender._id),
        User.findById(receiver._id),
      ]);

      expect(updatedSender.friends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: receiver._id, status: -1 }),
        ])
      );
      expect(updatedReceiver.friends.length).toBe(0);
    });

    it('should send and accept friend request', async () => {
      await sendFriendRequest(sender._id, receiver._id);
      await acceptFriendRequest(receiver._id, sender._id);

      const [updatedSender, updatedReceiver] = await Promise.all([
        User.findById(sender._id),
        User.findById(receiver._id),
      ]);

      expect(updatedSender.friends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: receiver._id, status: 2 }),
        ])
      );

      expect(updatedReceiver.friends).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ user: sender._id, status: 2 }),
        ])
      );
    });
  });
});

/**
 * Post Service
 */
describe('Post service', () => {
  describe('Given valid user and valid post data', () => {
    const validUserData = { username: 'userone' };
    let postData;
    let validUser;

    beforeEach(async () => {
      validUser = await createUser(validUserData);
      postData = {
        user: validUser._id,
        content: 'test post',
        comments: [],
      };
    });

    it('should create new post in db', async () => {
      const validPost = await createPost(postData);

      // check properties
      expect(mongoose.isValidObjectId(validPost._id)).toBe(true);
      expect(validPost.user).toBe(validUser._id);
      expect(validPost.content).toBe(postData.content);
      expect(Array.isArray(validPost.comments)).toBe(true);
      expect(Array.isArray(validPost.likes)).toBe(true);
      expect(validPost.createdAt).toBeInstanceOf(Date);

      // check virtuals
      expect(validPost.url).toBe(`/post/${validPost._id}`);
    });

    it('should create a new post and add a like by valid user', async () => {
      const validPost = await createPost(postData);

      await likePost(validPost._id, validUser._id);
      const likedPost = await Post.findById(validPost._id);

      expect(likedPost.likes.length).toBe(1);
      expect(likedPost.likes).toEqual(expect.arrayContaining([validUser._id]));
    });
  });
});

/**
 * Comment Service
 */
describe('Comment service', () => {
  describe('Given valid user, valid post, and valid comment data', () => {
    const validUserData = { username: 'userone' };
    let validUser;
    let postData;
    let validPost;
    let commentData;

    beforeEach(async () => {
      validUser = await createUser(validUserData);

      postData = {
        user: validUser._id,
        content: 'test post',
        comments: [],
      };
      validPost = await createPost(postData);

      commentData = {
        user: validUser._id,
        content: 'test comment',
      };
    });

    it('should add new comment to the post', async () => {
      // Create comment and add to post
      const newComment = await addComment(validPost._id, commentData);

      // Retrieve post
      const retrievedPost = await Post.findById(validPost._id);

      // Check post for comment
      expect(retrievedPost.comments.length).toBe(1);
      expect(retrievedPost.comments[0]).toEqual(newComment._id);

      // Check comment properties
      expect(newComment.user).toStrictEqual(validUser._id);
      expect(newComment.content).toBe(commentData.content);
      expect(Array.isArray(newComment.likes)).toBe(true);
      expect(newComment.createdAt).toBeInstanceOf(Date);
    });

    it('should add new comment to the post and like the post by valid user', async () => {
      const newComment = await addComment(validPost._id, commentData);

      await likeComment(newComment._id, validUser._id);

      const likedComment = await Comment.findById(newComment._id);

      expect(likedComment.likes.length).toBe(1);
      expect(likedComment.likes).toEqual(
        expect.arrayContaining([validUser._id])
      );
    });
  });
});
