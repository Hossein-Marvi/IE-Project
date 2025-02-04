const Lesson = require('../models/Lesson')

class LessonService {
  async getAllLessons() {
    try {
      return await Lesson.find().sort({ lessonName: 1 })
    } catch (error) {
      throw new Error('Error fetching lessons: ' + error.message)
    }
  }

  async getLessonById(id) {
    try {
      const lesson = await Lesson.findById(id)
      if (!lesson) {
        throw new Error('Lesson not found')
      }
      return lesson
    } catch (error) {
      throw new Error('Error fetching lesson: ' + error.message)
    }
  }

  async createLesson(lessonData) {
    try {
      const lesson = new Lesson(lessonData)
      return await lesson.save()
    } catch (error) {
      throw new Error('Error creating lesson: ' + error.message)
    }
  }

  async updateLesson(id, lessonData) {
    try {
      const lesson = await Lesson.findByIdAndUpdate(id, lessonData, {
        new: true,
        runValidators: true,
      })
      if (!lesson) {
        throw new Error('Lesson not found')
      }
      return lesson
    } catch (error) {
      throw new Error('Error updating lesson: ' + error.message)
    }
  }

  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findByIdAndDelete(id)
      if (!lesson) {
        throw new Error('Lesson not found')
      }
      return lesson
    } catch (error) {
      throw new Error('Error deleting lesson: ' + error.message)
    }
  }
}

module.exports = new LessonService()
