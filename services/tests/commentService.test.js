const mongoose = require('mongoose');
const { createUser } = require('../userService');
const { createPost, getPosts } = require('../postService');
const {
  addComment,
  likeComment,
  getComments,
  getCommentsByUser,
  updateComment,
  deleteComment,
  //deleteCommentsByUser,
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
        // create comment and add to post
        const newComment = await addComment(validPost._id, validCommentData);
        // retrieve post
        const retrievedPost = await Post.findById(validPost._id);

        // check post for comment
        expect(retrievedPost.comments.length).toBe(1);
        expect(retrievedPost.comments[0]).toEqual(newComment._id);
        // check comment properties
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
        // like added comment
        const likedComment = await likeComment(newComment._id, validUser._id);

        expect(likedComment.likes.length).toBe(1);
        expect(likedComment.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });

      it('should throw an error if comment is liked more than once', async () => {
        // like added comment
        const likedComment = await likeComment(newComment._id, validUser._id);
        // like comment a second time with same user
        await expect(
          likeComment(newComment._id, validUser._id)
        ).rejects.toThrow('This comment has already been liked by this user.');

        expect(likedComment.likes.length).toBe(1);
        expect(likedComment.likes).toEqual(
          expect.arrayContaining([validUser._id])
        );
      });

      it('should throw an error if comment is not found', async () => {
        await expect(
          likeComment(new mongoose.Types.ObjectId(), validUser._id)
        ).rejects.toThrow('No comment(s) found.');
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
        // retrieve post with comments
        const retrievedPost = await Post.findById(Seed.postsData[0]._id);
        // retrieve comments
        const retrievedComments = await getComments(retrievedPost.comments);

        await expect(retrievedComments.length).toBe(7);
      });
      it('should throw an error if no comments found', async () => {
        // random objectID
        const commentId = new mongoose.Types.ObjectId();

        await expect(getComments([commentId])).rejects.toThrow(
          'No comment(s) found.'
        );
      });
    });
    describe('getCommentsByUser', () => {
      it('should get no comments for first user', async () => {
        // retrieve comments
        const retrievedComments = await getCommentsByUser(
          Seed.usersData[0]._id
        );

        expect(retrievedComments.length).toBe(0);
      });

      it('should get all comments by a user with comments', async () => {
        // retrieve comments
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

    describe('updateComment', () => {
      it('should update comment with new content', async () => {
        // update and then retrieve updated comment
        const updatedComment = await updateComment(
          Seed.commentsData[0]._id,
          'Content has been revised.'
        );

        expect(updatedComment.content).toBe('Content has been revised.');
      });

      it('should throw an error if no comment found to update', async () => {
        await expect(
          updateComment(
            new mongoose.Types.ObjectId(),
            'No comment for this content.'
          )
        ).rejects.toThrow('No comment found to update.');
      });
    });

    describe('deleteComment', () => {
      it('should delete one comment', async () => {
        const commentId = Seed.commentsData[0]._id;
        // initial comments
        const initialComments = await getCommentsByUser(
          Seed.commentsData[0].user
        );
        expect(initialComments.length).toBe(1);

        const [postWithComments] = await getPosts([Seed.postsData[0]]);
        expect(postWithComments.comments.length).toBe(7);
        expect(
          postWithComments.comments.map((comment) => comment.toString())
        ).toEqual(expect.arrayContaining([commentId]));

        // delete comments and then attempt to retrieve
        const updatedPost = await deleteComment(
          commentId,
          Seed.postsData[0]._id
        );

        const allRetrievedComments = await getCommentsByUser(
          Seed.commentsData[0].user
        );
        expect(allRetrievedComments.length).toBe(0);

        expect(updatedPost.comments.length).toBe(6);
        expect(
          updatedPost.comments.map((comment) => comment.toString())
        ).not.toEqual(expect.arrayContaining([commentId]));
      });

      it('should throw an error if no comments to delete', async () => {
        // random objectID
        const commentId = new mongoose.Types.ObjectId();
        const postId = new mongoose.Types.ObjectId();

        await expect(deleteComment(commentId, postId)).rejects.toThrow(
          'No post modified.'
        );
      });
    });

    /* describe('deleteCommentsByUser', () => {
      it('should delete all comments by a user with comments', async () => {
        // delete comments and then attempt to retrieve
        await deleteCommentsByUser(Seed.usersData[1]._id);
        const retrievedCommentsByUser = await getCommentsByUser(
          Seed.usersData[1]._id
        );

        expect(retrievedCommentsByUser.length).toBe(0);
      });

      it('should throw an error if no comments to delete', async () => {
        // random objectID
        const userId = new mongoose.Types.ObjectId();

        await expect(deleteCommentsByUser([userId])).rejects.toThrow(
          'No comment(s) deleted.'
        );
      });
    }); */
  });
});
