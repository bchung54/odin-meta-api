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
    if (users.length === 0) {
      throw new Error('No user(s) found.');
    }
    return users;
  } catch (err) {
    throw new Error(err);
  }
}

async function getPotentialFriends(userId) {
  try {
    const [user] = await getUsers([userId]);
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

async function updateUsername(updatedData) {
  try {
    // check user exists *** ADD TO CONTROLLER ***
    // await getUsers([updatedData._id]);

    await User.updateOne(
      { _id: updatedData._id },
      { $set: { username: updatedData.username } }
    );
    return;
  } catch (err) {
    throw new Error(err);
  }
}

async function sendFriendRequest(sender, receiverId) {
  try {
    // check that users exist *** ADD TO CONTROLLER ***
    /* const users = await getUsers([senderId, receiverId]);
    const [sender, receiver] = users;
    if (!receiver) {
      throw new Error(
        'One or both users not found. Two valid users needed for friend request.'
      );
    } */
    const receiverFriendObj = sender.friends.find(
      (friend) => friend.user.toString() == receiverId
    );

    if (receiverFriendObj && receiverFriendObj.status === -2) {
      await Promise.all([
        User.updateOne(
          {
            _id: sender._id,
            'friends.user': receiverId,
          },
          {
            $set: { 'friends.$.status': 0 },
          }
        ),
        User.updateOne(
          {
            _id: receiverId,
            'friends.user': sender._id,
          },
          { $set: { 'friends.$.status': 1 } }
        ),
      ]);
      return;
    }

    await Promise.all([
      User.updateOne(
        { _id: sender._id },
        {
          $push: { friends: { user: receiverId, status: 0 } },
        }
      ),
      User.updateOne(
        { _id: receiverId },
        {
          $push: { friends: { user: sender._id, status: 1 } },
        }
      ),
    ]);

    // *** ADD TO CONTROLLER ***
    /* else {
      let message;
      switch (receiverFriendObj.status) {
        case 0:
          message =
            'Friend request has already been sent. Pending action by other user.';
          break;
        case 1:
          message =
            'Friend request has already been received. Pending action by you.';
          break;
        case -1:
          message =
            'Friend request has been rejected. Other user must initiate friend request.';
          break;
        default:
          throw new Error('Friend status code out of range.');
      }
      throw new Error(`Unable to send friend request: ${message}`);
    } */
  } catch (err) {
    throw new Error(err);
  }
}
async function rejectFriendRequest(rejecterId, rejectedId) {
  try {
    // check that users exist *** ADD TO CONTROLLER ***
    /* const users = await getUsers([rejecterId, rejectedId]);
    const [rejecter, rejected] = users; // rejecter received request, rejected sent request
    if (!rejected) {
      throw new Error(
        'One or both users not found. Two valid users needed for this operation.'
      );
    } */

    // *** ADD TO CONTROLLER ***
    /* const rejectedFriendObj = rejecter.friends.find(
      (friend) => friend.user.toString() == rejected._id
    );

    if (rejectedFriendObj === undefined) {
      throw new Error('No request found.');
    }
    if (rejectedFriendObj.status !== 1) {
      throw new Error('No request to reject for this user.');
    }
 */
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
    // check that users exist *** ADD TO CONTROLLER ***
    /* const users = await getUsers([acceptingId, acceptedId]);
    const [accepting, accepted] = users;
    if (!accepted) {
      throw new Error(
        'One or both users not found. Two valid users needed for this operation.'
      );
    } */

    // *** ADD TO CONTROLLER ***
    /* const acceptedFriendObj = accepting.friends.find(
      (friend) => friend.user.toJSON() == acceptedId
    );

    if (acceptedFriendObj === undefined) {
      throw new Error('No request found.');
    }
    if (acceptedFriendObj.status !== 1) {
      throw new Error('No request to accept for this user.');
    } */

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
    const [deleteResult, updateResult] = await Promise.all([
      User.deleteOne({ _id: userId }),
      User.updateMany({}, { $pull: { friends: { user: userId } } }),
    ]);
    if (deleteResult.deletedCount === 0) {
      throw new Error(
        `No user deleted. User was found in ${updateResult.upsertedCount} other users' friends list and pulled.`
      );
    }
    return;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = {
  createUser,
  getUsers,
  getPotentialFriends,
  updateUsername,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  deleteUser,
};
