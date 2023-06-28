const mongoose = require('mongoose');
const { createUser } = require('../userService');
const { createPost, getPosts } = require('../postService');
const {
  addComment,
  likeComment,
  getComments,
  getCommentsByUser,
  deleteComments,
  deleteCommentsByUser,
} = require('../commentService');
// models
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
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

describe('Comment service', () => {
  describe('given valid user, valid post, and valid comment data', () => {
    const validUserData = Seed.usersData[0];
    const validPostData = Seed.postsData[0];
    const validCommentData = Seed.commentsData[0];

    let validUser;
    let validPost;

    beforeEach(async () => {
      validUser = await createUser(validUserData);
      validPost = await createPost(validPostData);
    });

    describe('addComment', () => {
      it('should add new comment to a post', async () => {
        // Create comment and add to post
        const newComment = await addComment(validPost._id, validCommentData);

        // Retrieve post
        const retrievedPost = await Post.findById(validPost._id);

        // Check post for comment
        expect(retrievedPost.comments.length).toBe(1);
        expect(retrievedPost.comments[0]).toEqual(newComment._id);

        // Check comment properties
        expect(mongoose.isValidObjectId(newComment._id)).toBe(true);
        expect(newComment.user).toEqual(
          new mongoose.Types.ObjectId(validCommentData.user)
        );
        expect(newComment.content).toBe(validCommentData.content);
        expect(Array.isArray(newComment.likes)).toBe(true);
        expect(newComment.createdAt).toBeInstanceOf(Date);
      });
    });

    describe('likeComment', () => {
      let newComment;
      beforeEach(async () => {
        newComment = await addComment(validPost._id, validCommentData);
      });

      it('should like a new comment', async () => {
        // Like added comment
        await likeComment(newComment._id, validUser._id);

        // Retreive liked comment
        const likedComment = await Comment.findById(newComment._id);

        // Check liked comment properties
        expect(likedComment.likes.length).toBe(1);
        expect(likedComment.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });

      it('should only like a comment once maximum', async () => {
        // Like added comment
        await likeComment(newComment._id, validUser._id);

        // Like comment a second time with same user
        await likeComment(newComment._id, validUser._id);

        // Retrieve liked comment
        const likedComment = await Comment.findById(newComment._id);

        // Check liked comment properties
        expect(likedComment.likes.length).toBe(1);
        expect(likedComment.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });
    });
  });

  describe('given many users with one post and one comment each, except for first user', () => {
    beforeEach(async () => {
      await User.insertMany(Seed.usersData);
      await Post.insertMany(Seed.postsData);
      await Promise.all(
        Seed.commentsData.map(async (comment) => {
          await addComment(Seed.postsData[0]._id, comment);
        })
      );
    });

    describe('getComments', () => {
      it('should get all comments of a post', async () => {
        // Retrieve post with comments
        const retrievedPost = await Post.findById(Seed.postsData[0]._id);
        // Retrieve comments
        const retrievedComments = await getComments(retrievedPost.comments);

        expect(retrievedComments.length).toBe(7);
      });
    });
    describe('getCommentsByUser', () => {
      it('should get no comments for first user', async () => {
        // Retrieve comments
        const retrievedComments = await getCommentsByUser(
          Seed.usersData[0]._id
        );

        expect(retrievedComments.length).toBe(0);
      });

      it('should get all comments by a user with comments', async () => {
        // Retrieve comments
        const retrievedComments = await getCommentsByUser(
          Seed.usersData[1]._id
        );

        expect(retrievedComments.length).toBe(1);
        expect(retrievedComments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              user: new mongoose.Types.ObjectId(Seed.usersData[1]._id),
            }),
          ])
        );
      });
    });

    describe('deleteComments', () => {
      it('should delete one comment', async () => {
        await deleteComments([Seed.commentsData[0]._id]);
        const allRetrievedComments = await getCommentsByUser(
          Seed.commentsData[0].user
        );

        expect(allRetrievedComments.length).toBe(0);
      });
    });

    describe('deleteCommentsByUser', () => {
      it('should delete all comments by a user with comments', async () => {
        await deleteCommentsByUser(Seed.usersData[1]._id);
        const retrievedCommentsByUser = await getCommentsByUser(
          Seed.usersData[1]._id
        );

        expect(retrievedCommentsByUser.length).toBe(0);
      });
    });
  });
});
