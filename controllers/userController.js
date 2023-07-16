const mongoose = require('mongoose');
const {
  getCommentsByUser,
  // deleteCommentsByUser,
} = require('../services/commentService');
const {
  getPostsByUsers,
  // deletePostsByUser,
} = require('../services/postService');
const {
  getUsers,
  updateUsername,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  // deleteUser,
} = require('../services/userService');
const { body, validationResult } = require('express-validator');

// GET '/api/potential-friends'
exports.get_potential_friends = async (req, res, next) => {
  res.send('NOT IMPLEMENTED: get_potential_friends');
};

// GET '/api/:userId'
exports.get_user_info = async (req, res, next) => {
  try {
    const [user] = await getUsers([req.params.userId]);

    return res.status(200).json(user.toJSON());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET '/api/:userId/posts'
exports.get_user_posts = async (req, res, next) => {
  try {
    await getUsers([req.params.userId]);
    const posts = await getPostsByUsers([req.params.userId]);

    return res.status(200).json({ posts: posts });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET '/api/:userId/comments'
exports.get_user_comments = async (req, res, next) => {
  try {
    await getUsers([req.params.userId]);
    const comments = await getCommentsByUser([req.params.userId]);

    return res.status(200).json({ comments: comments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH '/api/:userId'
/* exports.update_username = [
  body('newUsername')
    .isLength({ min: 5, max: 99 })
    .withMessage('Username must be 5-99 characters long (inclusive).')
    .trim()
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      await getUsers([req.params.userId]);
      await updateUsername(req.body.newUsername);

      return res.status(204);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
]; */

//
exports.send_friend_request = [
  body('receiverId')
    .notEmpty()
    .withMessage('User to receive request must be specified.')
    .custom(async (receiverId) => {
      if (!mongoose.isValidObjectId(receiverId)) {
        throw new Error('Invalid user id for receiver.');
      }
    }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      await getUsers([req.body.receiverId]);
      await sendFriendRequest(req.user, req.body.receiverId);

      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

exports.reject_friend_request = [
  body('receiverId')
    .notEmpty()
    .withMessage('User to reject must be specified.')
    .custom(async (receiverId) => {
      if (!mongoose.isValidObjectId(receiverId)) {
        throw new Error('Invalid user id for rejected user.');
      }
    }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      await getUsers([req.body.receiverId]);

      const receiverFriendObj = req.user.friends.find(
        (friend) => friend.user.toString() == req.body.receiverId
      );

      if (receiverFriendObj === undefined) {
        throw new Error('No request found.');
      }
      if (receiverFriendObj.status !== 1) {
        throw new Error('No request to reject from this user.');
      }

      await rejectFriendRequest(req.user._id, req.body.receiverId);

      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

exports.accept_friend_request = [
  body('receiverId')
    .notEmpty()
    .withMessage('User to accept must be specified.')
    .custom(async (receiverId) => {
      if (!mongoose.isValidObjectId(receiverId)) {
        throw new Error('Invalid user id for accepted user.');
      }
    }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ message: 'Validation Failed', errors: errors.array() });
    }

    try {
      await getUsers([req.body.receiverId]);
      const receiverFriendObj = req.user.friends.find(
        (friend) => friend.user.toString() == req.body.receiverId
      );

      if (receiverFriendObj === undefined) {
        throw new Error('No request found.');
      }
      if (receiverFriendObj.status !== 1 && receiverFriendObj.status !== -2) {
        throw new Error('No request to accept from this user.');
      }

      await acceptFriendRequest(req.user._id, req.body.receiverId);

      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
];

/* exports.delete_user_comments = async (req, res, next) => {
  try {
    await deleteCommentsByUser(req.user._id);

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.delete_user_posts = async (req, res, next) => {
  try {
    await deletePostsByUser(req.user._id);

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.delete_user = async (req, res, next) => {
  try {
    await deleteUser(req.user._id);

    return res.status(204).end();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}; */
