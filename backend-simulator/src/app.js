const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
const errorHandler = require('./middleware/errorHandler')
const userRoutes = require('./routes/userRoutes')
const lessonRoutes = require('./routes/lessonRoutes')
const questionRoutes = require('./routes/questionRoutes')
const testRoutes = require('./routes/testRoutes')
const swaggerUi = require('swagger-ui-express')
const swaggerSpecs = require('./docs/swagger')
const path = require('path')
const fs = require('fs')
// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads/questions')
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', userRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/tests', testRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))
// Error handling
app.use(errorHandler)

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
module.exports = app
