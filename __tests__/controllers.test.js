const request = require('supertest');
const mongoose = require('mongoose');
const database = require('../config/mongoConfigTesting');
const Seed = require('../seeds');
const { app, server } = require('../server/testServer');
const { createUser } = require('../services/userService');

const authUser = Seed.mockUserData;
const authUserId = authUser._id;
const randomId = new mongoose.Types.ObjectId().toString();

afterAll(async () => {
  await database.dropDatabase();
  return server && server.close();
});

describe('user controller', () => {
  describe('given no user logged in', () => {
    describe('GET /api/users', () => {
      it('should redirect to login', async () => {
        const response = await request(app).get('/api/users');
        expect(response.statusCode).toBe(302);
      });
    });
  });
  describe('given user is logged in', () => {
    let agent, response;
    let otherUser;
    beforeAll(async () => {
      agent = request.agent(app);
      response = await agent.get('/api/auth/mock');
      otherUser = await createUser(Seed.usersData[1]);
      await createUser(Seed.mockSecondUserData);
      await createUser(Seed.mockThirdUserData);
    });

    /* afterEach(async () => {
      await agent.post('/logout');
    }); */

    describe('authCheck', () => {
      it('should return 200 with message: mock successful', async () => {
        expect(response.status).toEqual(200);
        expect(response.type).toBe('application/json');
        expect(response.header['content-length']).toBe('29');
        expect(response.body).toEqual({ message: 'mock successful' });
      });
    });

    // get_user_info
    // get all user info if user found
    // returns not found if user not found
    describe('get_user_info', () => {
      it('should return 200 with mock user info', async () => {
        const res = await agent.get(`/api/users/${authUserId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.objectContaining(authUser));
      });

      it('should return 500 "Error: No user(s) found."', async () => {
        const res = await agent.get(`/api/users/${randomId}`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual(
          expect.objectContaining({ message: 'Error: No user(s) found.' })
        );
      });
    });
    // get_user_posts
    // get all user posts if user found
    // returns not found if user not found
    describe('get_user_posts', () => {
      it('should return 200 with users posts', async () => {
        const res = await agent.get(`/api/users/${authUserId}/posts`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ posts: [] });
      });

      it('should return 500 "Error: No user(s) found."', async () => {
        const res = await agent.get(`/api/users/${randomId}/posts`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual(
          expect.objectContaining({ message: 'Error: No user(s) found.' })
        );
      });
    });
    // get_user_comments
    // get all user comments if user found
    // returns not found if user not found
    describe('get_user_comments', () => {
      it('should return 200 with users comments', async () => {
        const res = await agent.get(`/api/users/${authUserId}/comments`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ comments: [] });
      });

      it('should return 500 "Error: No user(s) found."', async () => {
        const res = await agent.get(`/api/users/${randomId}/comments`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: 'Error: No user(s) found.' });
      });
    });

    // update_user *** MOVED TO INDEX ***
    // validate user input and update user
    /* describe('update_user', () => {
      it('should return a 204 with username updated', async () => {
        const res = await agent
          .patch(`/api/users/${userPayload._id}`)
          .send({ newUsername: 'updatedMockUser' });

        expect(res.statusCode).toBe(204);
      });
    }); */

    // send_friend_request
    describe('send_friend_request', () => {
      it('should return 204 and send a friend request successfully', async () => {
        const otherUserId = otherUser._id.toString();
        const res = await agent
          .patch(`/api/users/${otherUserId}/sendFriend`)
          .send({ receiverId: otherUserId });

        const otherUserResponse = await agent.get(`/api/users/${otherUserId}`);
        const authUserResponse = await agent.get(`/api/users/${authUserId}`);
        const otherUserUpdated = otherUserResponse.body;
        const authUser = authUserResponse.body;

        expect(res.statusCode).toBe(204);

        expect(otherUserUpdated.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 1, user: authUserId }),
          ])
        );

        expect(authUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 0, user: otherUserId }),
          ])
        );
      });
    });

    describe('reject_friend_request', () => {
      it('should return 204 and reject a friend request successfully', async () => {
        const secondMockUserId = Seed.mockSecondUserData._id.toString();

        const rejectRequestResponse = await agent
          .patch(`/api/users/${secondMockUserId}/rejectFriend`)
          .send({ receiverId: secondMockUserId });

        const secondMockUserResponse = await agent.get(
          `/api/users/${secondMockUserId}`
        );
        const authUserResponse = await agent.get(`/api/users/${authUserId}`);
        const secondMockUser = secondMockUserResponse.body;
        const authUser = authUserResponse.body;

        expect(rejectRequestResponse.statusCode).toBe(204);

        expect(secondMockUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: -1, user: authUserId }),
          ])
        );

        expect(authUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: -2, user: secondMockUserId }),
          ])
        );
      });
    });

    describe('accept_friend_request', () => {
      it('should return 204 and accept friend request successfully', async () => {
        const thirdMockUserId = Seed.mockThirdUserData._id.toString();

        const acceptRequestResponse = await agent
          .patch(`/api/users/${thirdMockUserId}/acceptFriend`)
          .send({ receiverId: thirdMockUserId });

        const thirdMockUserResponse = await agent.get(
          `/api/users/${thirdMockUserId}`
        );
        const authUserResponse = await agent.get(`/api/users/${authUserId}`);
        const thirdMockUser = thirdMockUserResponse.body;
        const authUser = authUserResponse.body;

        expect(acceptRequestResponse.statusCode).toBe(204);

        expect(thirdMockUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 2, user: authUserId }),
          ])
        );
        expect(authUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 2, user: thirdMockUserId }),
          ])
        );
      });

      it('should return 204 and accept friend request after rejection', async () => {
        const secondMockUserId = Seed.mockSecondUserData._id.toString();

        const acceptRequestResponse = await agent
          .patch(`/api/users/${secondMockUserId}/acceptFriend`)
          .send({ receiverId: secondMockUserId });

        const secondMockUserResponse = await agent.get(
          `/api/users/${secondMockUserId}`
        );
        const authUserResponse = await agent.get(`/api/users/${authUserId}`);
        const secondMockUser = secondMockUserResponse.body;
        const authUser = authUserResponse.body;

        expect(acceptRequestResponse.statusCode).toBe(204);

        expect(secondMockUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 2, user: authUserId }),
          ])
        );

        expect(authUser.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ status: 2, user: secondMockUserId }),
          ])
        );
      });
    });
    // delete_user
    // delete user if found
    // returns not found if user not found
    // describe('delete_user', () => {});

    // delete_user_posts
    // delete all user posts if user found
    // returns not found if user not found
    // describe('delete_user_posts', () => {});

    // delete_user_comments
    // delete all user comments if user found
    // returns not found if user not found
    // describe('delete_user_comments', () => {});
  });
});

describe('post controller', () => {
  describe('given no user logged in', () => {
    describe('GET /api/posts', () => {
      it('should redirect to login', async () => {
        const response = await request(app).get('/api/posts');
        expect(response.statusCode).toBe(302);
      });
    });
  });
  describe('given user is logged in', () => {
    let agent, response;
    let postId, commentId;
    beforeAll(async () => {
      agent = request.agent(app);
      response = await agent.get('/api/auth/mock');
    });

    describe('authCheck', () => {
      it('should return a 200 with message: mock successful', async () => {
        expect(response.status).toEqual(200);
        expect(response.type).toBe('application/json');
        expect(response.header['content-length']).toBe('29');
        expect(response.body).toEqual({ message: 'mock successful' });
      });
    });

    // create_new_post
    // validate post input and create new post
    describe('create_new_post', () => {
      it('should return 201 with a new post created', async () => {
        const res = await agent
          .post('/api/posts/')
          .send({ content: 'Hello meta world!' });

        postId = res.body._id;
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            user: authUserId,
            content: 'Hello meta world!',
          })
        );
      });
    });

    // get_post_info
    // get post info if post found
    // returns not found if post not found
    describe('get_post_info', () => {
      it('should return 200 with post info', async () => {
        const res = await agent.get(`/api/posts/${postId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            user: authUserId,
            content: 'Hello meta world!',
          })
        );
      });

      it('should return 500 "Error: No post(s) found.', async () => {
        const res = await agent.get(`/api/posts/${randomId}`);

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: 'Error: No post(s) found.' });
      });
    });

    // create_new_comment
    // create new comment if post found
    // returns error if post not found
    describe('create_new_comment', () => {
      it('should return 201 with a new comment created', async () => {
        const res = await agent
          .post(`/api/posts/${postId}/comments`)
          .send({ content: 'First comment.' });

        commentId = res.body._id;
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual(
          expect.objectContaining({
            user: authUserId,
            content: 'First comment.',
          })
        );
      });

      it('should return 500 "Error: No post(s) found.', async () => {
        const res = await agent
          .post(`/api/posts/${randomId}/comments`)
          .send({ content: 'First comment.' });

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ message: 'Error: No post(s) found.' });
      });
    });

    // get_post_comments
    describe('get_post_comments', () => {
      it('should return 200 with post comments', async () => {
        const res = await agent.get(`/api/posts/${postId}/comments`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
          comments: expect.arrayContaining([
            expect.objectContaining({ _id: commentId }),
          ]),
        });
      });
    });

    // like_post

    // update_post
    // validate user and update post content
    describe('update_post', () => {
      it('should return 200 with post content updated', async () => {
        const res = await agent
          .patch(`/api/posts/${postId}`)
          .send({ updatedContent: 'Hello odin world!' });

        //expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            content: 'Hello odin world!',
          })
        );
      });
    });

    // update_comment
    // validate user and update comment content
    describe('update_comment', () => {
      it('should return 200 with comment content updated', async () => {
        const res = await agent
          .patch(`/api/posts/${postId}/comments/${commentId}`)
          .send({ updatedContent: 'First comment revised.' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(
          expect.objectContaining({
            content: 'First comment revised.',
          })
        );
      });
    });

    // like comment

    // delete_comment
    describe('delete_comment', () => {
      it('should return 204 with comments deleted', async () => {
        const postResponse = await agent.get(`/api/posts/${postId}`);
        expect(postResponse.body.comments).toEqual([commentId]);

        const res = await agent.delete(
          `/api/posts/${postId}/comments/${commentId}`
        );
        expect(res.statusCode).toBe(204);

        const updatedPostResponse = await agent.get(`/api/posts/${postId}`);
        expect(updatedPostResponse.body.comments).not.toEqual(
          expect.arrayContaining([commentId])
        );
      });
    });

    // delete_post
    describe('delete_post', () => {
      it('should return 204 with post deleted', async () => {
        const postResponse = await agent.get(`/api/posts/${postId}`);
        expect(postResponse.statusCode).toBe(200);

        const res = await agent.delete(`/api/posts/${postId}`);
        expect(res.statusCode).toBe(204);

        const updatedPostResponse = await agent.get(`/api/posts/${postId}`);
        expect(updatedPostResponse.statusCode).toBe(500);
        expect(updatedPostResponse.body).toEqual({
          message: 'Error: No post(s) found.',
        });
      });
    });
  });
});
