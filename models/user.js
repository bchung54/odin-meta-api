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
            -2, // rejected (status denotes rejected user)
            -1, // rejecter (status denotes rejecting user)
            0, // request sent (status denotes receiving user)
            1, // request received (status denotes sending user)
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
