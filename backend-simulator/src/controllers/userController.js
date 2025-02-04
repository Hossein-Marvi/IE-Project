const userService = require('../services/userService')

class UserController {
  async register(req, res) {
    try {
      const user = await userService.createUser(req.body)
      res.status(201).json({ message: 'User registered successfully', user })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body
      const result = await userService.loginUser(email, password)
      res.json({ message: 'Login successful', ...result })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async adminLogin(req, res) {
    try {
      const { email, password } = req.body
      const result = await userService.loginUser(email, password)

      if (result.user.role !== 'Admin') {
        return res.status(403).json({
          message: 'Access denied. Admin privileges required.',
        })
      }

      res.json({ message: 'Admin login successful', ...result })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await userService.getUserProfile(req.user.id)
      // Include role in the response
      res.json({
        fullName: profile.fullName,
        userId: profile.userId,
        role: req.user.role,
      })
    } catch (error) {
      res.status(404).json({ message: error.message })
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers()
      res.json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body)
      res.json(user)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id)
      res.json({ success: true, message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}

module.exports = new UserController()
