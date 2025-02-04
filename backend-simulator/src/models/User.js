const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  plainPassword: String,
  role: String,
  registeredOn: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', userSchema)
