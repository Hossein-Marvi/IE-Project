const TestAttempt = require('../models/TestAttempt')
const Question = require('../models/Question')

class TestService {
  async submitAnswer(userId, data) {
    const { questionId, selectedAnswer, timeSpent } = data

    const question = await Question.findById(questionId)
    if (!question) {
      throw new Error('Question not found')
    }

    const isCorrect = selectedAnswer === question.correctAnswer

    const testAttempt = await TestAttempt.findOneAndUpdate(
      {
        user: userId,
        completedAt: null,
      },
      {
        $push: {
          answers: {
            question: questionId,
            selectedAnswer,
            isCorrect,
            timeSpent,
          },
        },
      },
      { new: true, upsert: true }
    )

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      solution: question.solution,
    }
  }

  async completeTest(userId, data) {
    const { lessonId, chapter, totalTime } = data

    const testAttempt = await TestAttempt.findOne({
      user: userId,
      completedAt: null,
    })

    if (!testAttempt) {
      throw new Error('No active test attempt found')
    }

    const correctAnswers = testAttempt.answers.filter((a) => a.isCorrect).length
    const score = (correctAnswers / testAttempt.answers.length) * 100

    testAttempt.lesson = lessonId
    testAttempt.chapter = chapter
    testAttempt.score = score
    testAttempt.totalQuestions = testAttempt.answers.length
    testAttempt.correctAnswers = correctAnswers
    testAttempt.timeSpent = totalTime
    testAttempt.completedAt = new Date()

    await testAttempt.save()

    return {
      score,
      correctAnswers,
      totalQuestions: testAttempt.answers.length,
      timeSpent: totalTime,
    }
  }

  async getTestHistory(userId) {
    return await TestAttempt.find({
      user: userId,
      completedAt: { $ne: null },
    })
      .populate('lesson', 'lessonName')
      .sort({ completedAt: -1 })
  }

  async getTestDetails(testId, userId) {
    const testAttempt = await TestAttempt.findOne({
      _id: testId,
      user: userId,
    })
      .populate('lesson', 'lessonName')
      .populate({
        path: 'answers.question',
        select: 'questionText options correctAnswer imageUrl solution',
      })

    if (!testAttempt) {
      throw new Error('Test attempt not found')
    }

    const wrongAnswers = testAttempt.answers.filter(
      (a) => !a.isCorrect && a.selectedAnswer !== 'empty'
    ).length
    const emptyAnswers = testAttempt.answers.filter(
      (a) => a.selectedAnswer === 'empty'
    ).length

    return {
      ...testAttempt.toObject(),
      wrongAnswers,
      emptyAnswers,
    }
  }

  async getPerformanceStats(userId) {
    const tests = await TestAttempt.find({
      user: userId,
      completedAt: { $ne: null },
    })
      .populate('lesson', 'lessonName')
      .sort({ completedAt: -1 })

    const totalTests = tests.length
    const totalTimeSpent = tests.reduce(
      (sum, test) => sum + (test.timeSpent || 0),
      0
    )
    const totalScore = tests.reduce((sum, test) => sum + (test.score || 0), 0)
    const averageScore = totalTests > 0 ? totalScore / totalTests : 0
    const successfulTests = tests.filter((test) => test.score >= 60).length
    const successRate =
      totalTests > 0 ? (successfulTests / totalTests) * 100 : 0

    return {
      totalTests,
      averageScore,
      totalTimeSpent,
      successRate,
      tests: this.formatTestsForPerformance(tests),
    }
  }

  formatTestsForPerformance(tests) {
    return tests.map((test) => {
      const emptyAnswers = test.answers.filter(
        (a) => a.selectedAnswer === 'empty'
      ).length
      const wrongAnswers = test.answers.filter(
        (a) => !a.isCorrect && a.selectedAnswer !== 'empty'
      ).length

      return {
        _id: test._id,
        chapter: test.chapter,
        date: test.completedAt,
        score: test.score,
        totalQuestions: test.totalQuestions,
        correctAnswers: test.correctAnswers,
        wrongAnswers,
        emptyAnswers,
        timeSpent: test.timeSpent,
        lessonName: test.lesson?.lessonName || 'Unknown Lesson',
      }
    })
  }
}

module.exports = new TestService()
