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
      const question = await questionService.createQuestion(req.body)
      res.status(201).json(question)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }

  async updateQuestion(req, res) {
    try {
      const question = await questionService.updateQuestion(
        req.params.id,
        req.body
      )
      res.json(question)
    } catch (error) {
      res.status(400).json({ message: error.message })
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
