const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress-controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Mentor routes
router.get('/mentor', roleMiddleware(['mentor']), progressController.getMentorProgress);
router.post('/mark-completed-for-student', roleMiddleware(['mentor']), progressController.markChapterCompletedForStudent);

// Student, Mentor, and Admin routes for viewing progress
router.get('/:courseId', roleMiddleware(['student', 'mentor', 'admin']), progressController.getProgress);
// Student-only routes
router.post(
    '/mark-completed',
    authMiddleware,
    roleMiddleware(['student']),
    progressController.markChapterCompleted
);


module.exports = router;
