const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/lessonController')
const { protect, adminOnly } = require('../middleware/auth')

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - lessonName
 *         - chapter
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         lessonName:
 *           type: string
 *           description: Name of the lesson
 *         chapter:
 *           type: string
 *           description: Chapter number or name
 *         description:
 *           type: string
 *           description: Detailed description of the lesson
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: List of all lessons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 lessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 */
router.get('/', lessonController.getAllLessons)

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 */
router.get('/:id', lessonController.getLessonById)

/**
 * @swagger
 * /lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lessonName
 *               - chapter
 *             properties:
 *               lessonName:
 *                 type: string
 *               chapter:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lesson created successfully
 */
router.post('/', protect, adminOnly, lessonController.createLesson)

/**
 * @swagger
 * /lessons/{id}:
 *   put:
 *     summary: Update a lesson
 *     tags: [Lessons]
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
 *             $ref: '#/components/schemas/Lesson'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 */
router.put('/:id', protect, adminOnly, lessonController.updateLesson)

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 */
router.delete('/:id', protect, adminOnly, lessonController.deleteLesson)

module.exports = router
