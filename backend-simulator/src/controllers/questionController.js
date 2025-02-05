const questionService = require('../services/questionService')

class QuestionController {
  async getAllQuestions(req, res) {
    try {
      const questions = await questionService.getAllQuestions()
      res.json(questions)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async createQuestion(req, res) {
    try {
      console.log('Received form data:', req.body) // Debug log

      // Parse the options JSON string
      const options = JSON.parse(req.body.options)

      const questionData = {
        questionText: req.body.questionText,
        options: options, // Use the parsed options object directly
        correctAnswer: req.body.correctAnswer,
        difficulty: req.body.difficulty,
        lesson: req.body.lesson,
        chapter: req.body.chapter,
        solution: req.body.solution,
      }

      // Add image URL if file was uploaded
      if (req.file) {
        questionData.imageUrl = `/uploads/questions/${req.file.filename}`
      }

      console.log('Processing question data:', questionData) // Debug log

      const question = await questionService.createQuestion(questionData)
      res.status(201).json(question)
    } catch (error) {
      console.error('Error creating question:', error)
      res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
    }
  }
  async updateQuestion(req, res) {
    try {
      const updateData = req.body

      // Add image URL if new file was uploaded
      if (req.file) {
        updateData.imageUrl = `/uploads/questions/${req.file.filename}`
      }

      const question = await questionService.updateQuestion(
        req.params.id,
        updateData
      )
      res.json(question)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async deleteQuestion(req, res) {
    try {
      await questionService.deleteQuestion(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }

  async getQuestionCounts(req, res) {
    try {
      const { lesson, chapter } = req.query
      if (!lesson || !chapter) {
        return res.status(400).json({
          success: false,
          message: 'Lesson ID and Chapter are required',
        })
      }

      const counts = await questionService.getQuestionCounts(lesson, chapter)
      res.json({
        success: true,
        counts,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPracticeQuestions(req, res) {
    try {
      const { lesson, chapter, easy, medium, hard } = req.query

      const counts = {
        easy: parseInt(easy) || 0,
        medium: parseInt(medium) || 0,
        hard: parseInt(hard) || 0,
      }

      const questions = await questionService.getPracticeQuestions(
        lesson,
        chapter,
        counts
      )

      res.json({
        success: true,
        questions,
        totalQuestions: questions.length,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new QuestionController()
