const mongoose = require('mongoose')

const TestAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  chapter: String,
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  timeSpent: Number,
  completedAt: { type: Date, default: Date.now },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
      selectedAnswer: String,
      isCorrect: Boolean,
      timeSpent: Number,
    },
  ],
})

module.exports = mongoose.model('TestAttempt', TestAttemptSchema)
