const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  friends_list: { type: Array, required: true, default: [] },
});

/* UserSchema.virtual('name').get(function () {
  return `${this.first_name} ${this.last_name}`;
}); */

UserSchema.virtual('url').get(function () {
  return `/user/${this.username}`;
});

module.exports = mongoose.model('User', UserSchema);
