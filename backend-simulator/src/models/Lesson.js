const mongoose = require('mongoose')

const lessonSchema = new mongoose.Schema(
  {
    lessonName: {
      type: String,
      required: true,
      trim: true,
    },
    chapters: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Lesson', lessonSchema)
