const User = require('../models/user');

async function createUser(userData) {
  try {
    const user = await User.create(userData);
    return user;
  } catch (err) {
    throw new Error(err);
  }
}

async function sendFriendRequest(senderId, receiverId) {
  try {
    await Promise.all([
      User.updateOne(
        { _id: senderId },
        {
          $push: { friends: { user: receiverId, status: 0 } },
        }
      ),
      User.updateOne(
        { _id: receiverId },
        {
          $push: { friends: { user: senderId, status: 1 } },
        }
      ),
    ]);
    return;
  } catch (err) {
    throw new Error(err);
  }
}
async function rejectFriendRequest(rejecterId, rejectedId) {
  try {
    await Promise.all([
      User.updateOne(
        { _id: rejectedId, 'friends.user': rejecterId },
        { $set: { 'friends.$.status': -1 } }
      ),
      User.updateOne(
        { _id: rejecterId },
        { $pull: { friends: { user: rejectedId } } }
      ),
    ]);
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function acceptFriendRequest(acceptingId, acceptedId) {
  try {
    await Promise.all([
      User.updateOne(
        { _id: acceptingId, 'friends.user': acceptedId },
        { $set: { 'friends.$.status': 2 } }
      ),
      User.updateOne(
        { _id: acceptedId, 'friends.user': acceptingId },
        { $set: { 'friends.$.status': 2 } }
      ),
    ]);
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createUser,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
};
