const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
      default: [],
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
  },
  { timestamps: true }
);

PostSchema.virtual('url').get(function () {
  return `/post/${this._id}`;
});

module.exports = mongoose.model('Post', PostSchema);
