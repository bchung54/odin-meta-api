const User = require('../models/user');

async function createUser(userData) {
  try {
    const user = await User.create(userData);
    return user;
  } catch (err) {
    throw new Error(err);
  }
}

async function getUsers(userIds) {
  try {
    if (!userIds) {
      const users = await User.find({});
      return users;
    }
    const users = await User.find({ _id: { $in: userIds } });
    return users;
  } catch (err) {
    throw new Error(err);
  }
}

async function updateUsername(updatedData) {
  try {
    const user = await User.findById(updatedData._id);
    user.username = updatedData.username;
    await user.save();
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function getPotentialFriends(userId) {
  try {
    const user = await User.findById(userId);
    const friendsListIds = user.friends.map((friend) => {
      return friend.user;
    });
    const potentialFriends = await User.find({
      _id: { $nin: [...friendsListIds, user._id] },
    });
    return potentialFriends;
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
        { _id: rejecterId, 'friends.user': rejectedId },
        { $set: { 'friends.$.status': -2 } }
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

async function deleteUser(userId) {
  try {
    await Promise.all([
      User.deleteOne({ _id: userId }),
      User.updateMany({}, { $pull: { friends: { user: userId } } }),
    ]);
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUsername,
  getPotentialFriends,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  deleteUser,
};
