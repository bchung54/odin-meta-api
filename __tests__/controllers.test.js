const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const UserService = require('../services/userService');
const Seed = require('../seeds');

const userPayload = Seed.mockUserData;

afterAll(async () => {
  await mongoose.connection.close();
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
    let server, agent, response;
    beforeAll((done) => {
      server = app.listen(3000, (err) => {
        if (err) return done(err);
        agent = request.agent(server);
        done();
      });
    });

    beforeEach(async () => {
      response = await agent.get('/api/auth/mock');
    });

    /* afterEach(async () => {
      await agent.post('/logout');
    }); */

    afterAll((done) => {
      return server && server.close(done);
    });

    describe('authCheck', () => {
      it('should return a 200 with message: mock successful', async () => {
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
      it('should return a 200 with mock user info', async () => {
        const getUserServiceMock = jest
          .spyOn(UserService, 'getUsers')
          .mockReturnValueOnce(userPayload);
        const res = await agent.get(`/api/users/${userPayload._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.objectContaining(userPayload));
        expect(getUserServiceMock).toHaveBeenCalledWith([userPayload._id]);
      });

      it('should return a 500 "Error: No user(s) found."', async () => {
        const res = await agent.get(
          `/api/users/${new mongoose.Types.ObjectId().toString()}`
        );

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
      //it('should return a 200 with users posts');
    });
    // get_user_comments
    // get all user comments if user found
    // returns not found if user not found
    describe('get_user_comments', () => {});
    // create_new_post
    // validate post input and create new post
    describe('create_new_post', () => {});
    // update_user
    // validate user input and update user
    describe('update_user', () => {});
    // delete_user
    // delete user if found
    // returns not found if user not found
    describe('delete_user', () => {});
    // delete_user_posts
    // delete all user posts if user found
    // returns not found if user not found
    describe('delete_user_posts', () => {});
    // delete_user_comments
    // delete all user comments if user found
    // returns not found if user not found
    describe('delete_user_comments', () => {});
  });
});
