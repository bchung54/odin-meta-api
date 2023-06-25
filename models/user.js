const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  googleId: { type: String },
  picture: { type: String },
  friends: {
    type: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: Number,
          enums: [
            -1, // rejected by user
            0, // request sent to user
            1, // request received from user
            2, // friends
          ],
        },
      },
    ],
    default: [],
  },
});

/* UserSchema.virtual('name').get(function () {
  return `${this.first_name} ${this.last_name}`;
}); */

UserSchema.virtual('url').get(function () {
  return `/user/${this.username}`;
});

module.exports = mongoose.model('User', UserSchema);
