const app = require('./src/app')
const connectDB = require('./src/config/database')

const PORT = process.env.PORT || 5001

// Connect to database
connectDB()

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
