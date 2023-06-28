const { faker } = require('@faker-js/faker');

const NUM_OF_USERS = 8;
let usersData;
let friendsTrioData;
let friendsRejectedData;
let postsData;
let commentsData;

function generateUsers(num) {
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push({
      _id: faker.database.mongodbObjectId(),
      username: faker.internet.userName(),
    });
  }

  return users;
}

function generateFriendTrio() {
  const friendId1 = faker.database.mongodbObjectId();
  const friendId2 = faker.database.mongodbObjectId();
  const friendId3 = faker.database.mongodbObjectId();

  const trio = [
    {
      _id: friendId1,
      username: faker.internet.userName(),
      friends: [
        {
          user: friendId2,
          status: 2,
        },
        {
          user: friendId3,
          status: 2,
        },
      ],
    },
    {
      _id: friendId2,
      username: faker.internet.userName(),
      friends: [
        {
          user: friendId1,
          status: 2,
        },
        {
          user: friendId3,
          status: 2,
        },
      ],
    },
    {
      _id: friendId3,
      username: faker.internet.userName(),
      friends: [
        {
          user: friendId1,
          status: 2,
        },
        {
          user: friendId2,
          status: 2,
        },
      ],
    },
  ];

  return trio;
}

function generateFriendRejection() {
  const userId1 = faker.database.mongodbObjectId();
  const userId2 = faker.database.mongodbObjectId();
  const pair = [
    {
      _id: userId1,
      username: faker.internet.userName(),
      friends: [
        {
          user: userId2,
          status: -2,
        },
      ],
    },
    {
      _id: userId2,
      username: faker.internet.userName(),
      friends: [
        {
          user: userId1,
          status: -1,
        },
      ],
    },
  ];

  return pair;
}

function generatePosts(users) {
  const posts = [];
  users.forEach((user) => {
    const post = {
      _id: faker.database.mongodbObjectId(),
      user: user._id,
      content: `${user.username}'s sample post`,
    };
    posts.push(post);
  });

  return posts;
}

function generateComments(users) {
  const comments = [];
  users.forEach((user, index) => {
    // first user will not have a comment
    if (index != 0) {
      const userComment = {
        _id: faker.database.mongodbObjectId(),
        user: user._id,
        content: `${user.username}'s first sample comment`,
      };
      comments.push(userComment);
    }
  });

  return comments;
}

usersData = generateUsers(NUM_OF_USERS);
friendsTrioData = generateFriendTrio();
friendsRejectedData = generateFriendRejection();
postsData = generatePosts(usersData);
commentsData = generateComments(usersData);

module.exports = {
  NUM_OF_USERS,
  usersData,
  friendsTrioData,
  friendsRejectedData,
  postsData,
  commentsData,
  generatePosts,
};
