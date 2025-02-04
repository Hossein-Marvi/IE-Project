const express = require('express')
const router = express.Router()
const testController = require('../controllers/testController')
const { protect } = require('../middleware/auth')

/**
 * @swagger
 * components:
 *   schemas:
 *     TestAttempt:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         lessonId:
 *           type: string
 *         score:
 *           type: number
 *         answers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedAnswer:
 *                 type: string
 *               isCorrect:
 *                 type: boolean
 *               timeSpent:
 *                 type: number
 */

/**
 * @swagger
 * /tests/submit-answer:
 *   post:
 *     summary: Submit an answer for a question
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedAnswer
 *               - timeSpent
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedAnswer:
 *                 type: string
 *               timeSpent:
 *                 type: number
 */
router.post('/submit-answer', protect, testController.submitAnswer)

/**
 * @swagger
 * /tests/complete:
 *   post:
 *     summary: Complete a test
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonId
 *               - totalTime
 *             properties:
 *               lessonId:
 *                 type: string
 *               totalTime:
 *                 type: number
 */
router.post('/complete', protect, testController.completeTest)

/**
 * @swagger
 * /tests/history:
 *   get:
 *     summary: Get test history
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test history retrieved successfully
 */
router.get('/history', protect, testController.getTestHistory)

/**
 * @swagger
 * /tests/details/{testId}:
 *   get:
 *     summary: Get test details
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/details/:testId', protect, testController.getTestDetails)

/**
 * @swagger
 * /tests/performance:
 *   get:
 *     summary: Get performance statistics
 *     tags: [Tests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance statistics retrieved successfully
 */
router.get('/performance', protect, testController.getPerformance)

module.exports = router
