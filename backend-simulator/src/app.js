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

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api', userRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/tests', testRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
// Error handling
app.use(errorHandler)

module.exports = app
