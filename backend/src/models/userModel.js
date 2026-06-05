const mongoose = require('mongoose');
const { defineModel } = require('../config/db');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false }
}, {
  timestamps: true
});

const User = defineModel('User', userSchema);

module.exports = User;
