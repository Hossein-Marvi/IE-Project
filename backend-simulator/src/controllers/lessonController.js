const lessonService = require('../services/lessonService')

class LessonController {
  async getAllLessons(req, res) {
    try {
      const lessons = await lessonService.getAllLessons()
      res.json({
        success: true,
        lessons,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getLessonById(req, res) {
    try {
      const lesson = await lessonService.getLessonById(req.params.id)
      res.json({
        success: true,
        lesson,
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      })
    }
  }

  async createLesson(req, res) {
    try {
      const lesson = await lessonService.createLesson(req.body)
      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        lesson,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  async updateLesson(req, res) {
    try {
      const lesson = await lessonService.updateLesson(req.params.id, req.body)
      res.json({
        success: true,
        message: 'Lesson updated successfully',
        lesson,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  async deleteLesson(req, res) {
    try {
      await lessonService.deleteLesson(req.params.id)
      res.json({
        success: true,
        message: 'Lesson deleted successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new LessonController()
