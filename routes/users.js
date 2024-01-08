const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/pinproject")
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
   email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: String,
  contact: {
    type: Number,
    required: true
  },
  boards: {
    type: Array,
    default: []
  }
});
userSchema.plugin(plm)
module.exports = mongoose.model("user",userSchema)