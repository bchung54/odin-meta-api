const mongoose = require('mongoose');
const {
  createUser,
  getUsers,
  getPotentialFriends,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  updateUsername,
  deleteUser,
} = require('../userService');
// models
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

describe('User service', () => {
  describe('given valid user data', () => {
    const validUserData = Seed.usersData[0];

    describe('createUser', () => {
      it('should create user with correct properties in db', async () => {
        // create new user
        const validUser = await createUser(validUserData);

        // check properties
        expect(mongoose.isValidObjectId(validUser._id)).toBe(true);
        expect(validUser._id).toEqual(
          new mongoose.Types.ObjectId(validUserData._id)
        );
        expect(validUser.username).toEqual(validUserData.username);
        // check virtuals
        expect(validUser.url).toBe(`/user/${validUser.username}`);
      });
    });
  });

  describe('given two valid users', () => {
    let sender, receiver;
    beforeEach(async () => {
      sender = await createUser(Seed.usersData[0]);
      receiver = await createUser(Seed.usersData[1]);
    });
    describe('getUsers', () => {
      it('should get sender', async () => {
        const retrievedUser = await getUsers([sender._id]);
        expect(retrievedUser[0].equals(sender)).toBe(true);
      });
    });

    describe('updateUsername', () => {
      it('should update username', async () => {
        sender.username = 'newUsername_update';
        // update username
        await updateUsername(sender.toJSON());
        // retrieve updated user
        const updatedUser = await User.findById(sender._id);

        expect(updatedUser.username).toBe('newUsername_update');
      });
    });

    describe('friendRequest functions', () => {
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
        expect(updatedReceiver.friends).toEqual(
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
        expect(updatedReceiver.friends).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ user: sender._id, status: -2 }),
          ])
        );
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

  describe('given a user base with friend trio and a rejected friend pair (13 total)', () => {
    const userBaseData = Seed.usersData;
    const friendsTrioData = Seed.friendsTrioData;
    const friendsRejectedData = Seed.friendsRejectedData;
    beforeEach(async () => {
      await Promise.all([
        User.insertMany(userBaseData),
        User.insertMany(friendsTrioData),
        User.insertMany(friendsRejectedData),
      ]);
    });
    describe('getPotentialFriends', () => {
      it('should return all other users for user with no friend connections (12 others)', async () => {
        const potentialFriends = await getPotentialFriends(userBaseData[0]._id);
        expect(Array.isArray(potentialFriends)).toBe(true);
        expect(potentialFriends.length).toBe(12);
      });

      it('should return all other users except the two friends (10 others)', async () => {
        const potentialFriends = await getPotentialFriends(
          friendsTrioData[0]._id
        );
        expect(potentialFriends.length).toBe(10);
      });

      it('should return all users except for the rejected user (11 others)', async () => {
        const potentialFriends = await getPotentialFriends(
          friendsRejectedData[0]._id
        );
        expect(potentialFriends.length).toBe(11);
      });
    });

    describe('deleteUser', () => {
      it('should delete user and remove all connections with users in friend list', async () => {
        const userToBeDeleted = await getUsers([friendsTrioData[0]._id]);
        await deleteUser(userToBeDeleted[0]._id);

        const deletedUser = await getUsers([friendsTrioData[0]._id]);
        const friends = await getUsers([
          friendsTrioData[1]._id,
          friendsTrioData[2]._id,
        ]);

        expect(deletedUser.length).toBe(0);
        expect(friends[0].friends.length).toBe(1);
        expect(friends[1].friends.length).toBe(1);
      });
    });
  });
});
