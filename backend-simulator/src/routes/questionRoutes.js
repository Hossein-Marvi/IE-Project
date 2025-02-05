const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')
const { protect, adminOnly } = require('../middleware/auth')
const upload = require('../middleware/upload')
/**
 * @swagger
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       required:
 *         - questionText
 *         - options
 *         - correctAnswer
 *         - lessonId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         questionText:
 *           type: string
 *           description: The question text
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of possible answers
 *         correctAnswer:
 *           type: string
 *           description: The correct answer
 *         solution:
 *           type: string
 *           description: Explanation of the solution
 *         lessonId:
 *           type: string
 *           description: Reference to the lesson
 *         imageUrl:
 *           type: string
 *           description: URL of associated image (if any)
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: List of all questions
 */
router.get('/', questionController.getAllQuestions)

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question created successfully
 */
// router.post('/', protect, adminOnly, questionController.createQuestion)

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 */
// router.put('/:id', protect, adminOnly, questionController.updateQuestion)

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', protect, adminOnly, questionController.deleteQuestion)

/**
 * @swagger
 * /questions/counts:
 *   get:
 *     summary: Get question counts by lesson
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Question counts per lesson
 */
router.get('/counts', questionController.getQuestionCounts)

/**
 * @swagger
 * /questions/practice:
 *   get:
 *     summary: Get practice questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of practice questions
 */
router.get('/practice', protect, questionController.getPracticeQuestions)

router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'),
  questionController.createQuestion
)
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  questionController.updateQuestion
)

module.exports = router
