const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/jwt')

const protect = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Admin privileges required.' })
  }
  next()
}

module.exports = { protect, adminOnly }
