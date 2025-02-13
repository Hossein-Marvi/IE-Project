const Question = require('../models/Question')
const mongoose = require('mongoose')

class QuestionService {
  async getAllQuestions() {
    return await Question.find().populate('lesson', 'lessonName')
  }

  async createQuestion(questionData) {
    try {
      console.log('Creating question with data:', questionData) // Debug log
      const question = new Question({
        questionText: questionData.questionText,
        options: {
          A: questionData.options.A,
          B: questionData.options.B,
          C: questionData.options.C,
          D: questionData.options.D,
        },
        correctAnswer: questionData.correctAnswer,
        lesson: new mongoose.Types.ObjectId(questionData.lesson),
        chapter: questionData.chapter,
        difficulty: questionData.difficulty,
        solution: questionData.solution,
        imageUrl: questionData.imageUrl,
      })
      return await question.save()
    } catch (error) {
      console.error('Error in questionService.createQuestion:', error)
      throw error
    }
  }
  async updateQuestion(id, updateData) {
    if (updateData.lesson) {
      updateData.lesson = new mongoose.Types.ObjectId(updateData.lesson)
    }
    return await Question.findByIdAndUpdate(id, updateData, { new: true })
  }

  async deleteQuestion(id) {
    return await Question.findByIdAndDelete(id)
  }

  async getQuestionCounts(lesson, chapter) {
    const baseCriteria = {
      lesson: new mongoose.Types.ObjectId(lesson),
      chapter: chapter,
    }

    const [easyCount, mediumCount, hardCount] = await Promise.all([
      Question.countDocuments({ ...baseCriteria, difficulty: 'easy' }),
      Question.countDocuments({ ...baseCriteria, difficulty: 'medium' }),
      Question.countDocuments({ ...baseCriteria, difficulty: 'hard' }),
    ])

    return { easy: easyCount, medium: mediumCount, hard: hardCount }
  }

  async getPracticeQuestions(lesson, chapter, counts) {
    const baseCriteria = {
      lesson: new mongoose.Types.ObjectId(lesson),
      chapter: chapter,
    }

    const questions = await Promise.all([
      Question.aggregate([
        { $match: { ...baseCriteria, difficulty: 'easy' } },
        { $sample: { size: counts.easy } },
      ]),
      Question.aggregate([
        { $match: { ...baseCriteria, difficulty: 'medium' } },
        { $sample: { size: counts.medium } },
      ]),
      Question.aggregate([
        { $match: { ...baseCriteria, difficulty: 'hard' } },
        { $sample: { size: counts.hard } },
      ]),
    ])

    return questions.flat().map((q) => ({
      ...q,
      solution: undefined,
    }))
  }
}

module.exports = new QuestionService()
