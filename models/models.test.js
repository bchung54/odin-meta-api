const mongoose = require('mongoose');
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const FriendRequest = require('./friendRequest');
const db = require('../config/mongoConfigTesting');

const userData = {
  email: 'user@one.com',
  username: 'userone',
  password: 'passone',
};

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
 * User Model
 */
describe('User model', () => {
  it('creates and saves user successfully', async () => {
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    expect(mongoose.isValidObjectId(savedUser._id)).toBe(true);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.url).toBe(`/user/${savedUser.username}`);
  });

  it('inserts user successfully without including extra fields not defined in schema', async () => {
    const userWithInvalidField = new User({
      ...userData,
      nickname: 'nickname',
    });
    const savedUser = await userWithInvalidField.save();
    expect(mongoose.isValidObjectId(savedUser._id)).toBe(true);
    expect(savedUser.nickname).toBeUndefined();
  });

  it('fails to create user without required field', async () => {
    const userWithoutEmail = new User({
      username: 'NoEmail',
      password: 'noemmy',
    });
    let err;
    try {
      await userWithoutEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });
});

/**
 * Post Model
 */

describe('Post model', () => {
  let postData;
  let savedUser;

  beforeEach(async () => {
    const validUser = new User(userData);
    savedUser = await validUser.save();
    postData = {
      user: savedUser._id,
      content: 'test post',
      comments: [],
    };
  });

  it('creates and saves post successfully', async () => {
    const validPost = new Post(postData);
    const savedPost = await validPost.save();
    expect(mongoose.isValidObjectId(savedPost._id)).toBe(true);
    expect(savedPost.user).toBe(savedUser._id);
    expect(savedPost.content).toBe(postData.content);
    expect(Array.isArray(savedPost.comments)).toBe(true);
    expect(savedPost.likes).toBe(0);
    expect(savedPost.createdAt).toBeInstanceOf(Date);
    expect(savedPost.url).toBe(`/post/${savedPost._id}`);
  });
});

/**
 * Comment Model
 */
describe('Comment model', () => {
  let commentData;
  let postData;
  let savedPost;
  let savedUser;

  beforeEach(async () => {
    const validUser = new User(userData);
    savedUser = await validUser.save();

    postData = {
      user: savedUser._id,
      content: 'test post',
      comments: [],
    };
    const validPost = new Post(postData);
    savedPost = await validPost.save();

    commentData = {
      user: savedUser._id,
      content: 'test comment',
    };
  });

  it('creates and saves comment successfully', async () => {
    // Create comment and save
    const validComment = new Comment(commentData);
    const savedComment = await validComment.save();

    // Add comment to post and retrieve from database
    savedPost.comments = [savedComment._id];
    await savedPost.save();
    const updatedPost = await Post.findById(savedPost._id);

    expect(mongoose.isValidObjectId(savedComment._id)).toBe(true);
    expect(savedComment.user).toBe(savedUser._id);
    expect(savedComment.content).toBe(commentData.content);
    expect(savedComment.likes).toBe(0);
    expect(savedComment.createdAt).toBeInstanceOf(Date);

    expect(updatedPost.comments.length).toBe(1);
    expect(updatedPost.comments[0]).toStrictEqual(savedComment._id);
  });
});

/**
 * Friend Request Model
 */
describe('Friend request model', () => {
  let savedUser1, savedUser2;
  let requestData;
  const userData2 = {
    email: 'user@two.com',
    username: 'usertwo',
    password: 'passtwo',
  };

  beforeEach(async () => {
    const validUser1 = new User(userData);
    const validUser2 = new User(userData2);

    [savedUser1, savedUser2] = await Promise.all([
      validUser1.save(),
      validUser2.save(),
    ]);

    requestData = {
      sender: savedUser1._id,
      receiver: savedUser2._id,
    };
  });

  it('creates and saves a friend request succesfully', async () => {
    const newRequest = new FriendRequest(requestData);
    const savedRequest = await newRequest.save();

    expect(mongoose.isValidObjectId(newRequest._id)).toBe(true);
    expect(savedRequest.sender).toBe(requestData.sender);
    expect(savedRequest.receiver).toBe(requestData.receiver);
    expect(savedRequest.status).toBe('Pending');
    expect(savedRequest.createdAt).toBeInstanceOf(Date);
  });
});
