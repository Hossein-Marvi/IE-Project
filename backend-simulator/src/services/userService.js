const User = require('../models/User')
const { hashPassword, comparePasswords } = require('../utils/passwordUtils')
const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt')

class UserService {
  async createUser(userData) {
    const { fullName, email, password, role } = userData

    const userExists = await User.findOne({ email })
    if (userExists) {
      throw new Error('User already exists')
    }

    const hashedPassword = await hashPassword(password)

    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      plainPassword: password,
      role,
      registeredOn: new Date(),
    })

    await user.save()
    return user
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isMatch = await comparePasswords(password, user.password)
    if (!isMatch) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    return { token, user }
  }

  async getAllUsers() {
    return await User.find().select(
      '_id fullName email role registeredOn plainPassword'
    )
  }

  async updateUser(userId, updateData) {
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password)
      updateData.plainPassword = updateData.password
    }

    return await User.findByIdAndUpdate(userId, updateData, { new: true })
  }

  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId)
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    return {
      fullName: user.fullName,
      userId: user._id,
      role: user.role,
    }
  }
}

module.exports = new UserService()
