const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: { A: String, B: String, C: String, D: String },
  correctAnswer: String,
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  chapter: String,
  difficulty: String,
  imageUrl: String,
  solution: String,
})

module.exports = mongoose.model('Question', questionSchema)
