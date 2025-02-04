const testService = require('../services/testService')

class TestController {
  async submitAnswer(req, res) {
    try {
      const result = await testService.submitAnswer(req.user.id, req.body)
      res.json({
        success: true,
        ...result,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async completeTest(req, res) {
    try {
      const result = await testService.completeTest(req.user.id, req.body)
      res.json({
        success: true,
        ...result,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getTestHistory(req, res) {
    try {
      const testHistory = await testService.getTestHistory(req.user.id)
      res.json({
        success: true,
        testHistory,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getTestDetails(req, res) {
    try {
      const testDetails = await testService.getTestDetails(
        req.params.testId,
        req.user.id
      )
      res.json(testDetails)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  async getPerformance(req, res) {
    try {
      const performanceStats = await testService.getPerformanceStats(
        req.user.id
      )
      res.json(performanceStats)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
}

module.exports = new TestController()
