const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
    block: Boolean,
    attempts: {
      type: Array,
      default: [],
    },
  })
);

module.exports = User;
