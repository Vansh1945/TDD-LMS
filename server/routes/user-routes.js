const express = require('express');
const { getAllUsers, approveMentor, rejectMentor, deleteUser, getAnalytics, registerMentor, getStudents, getMentorDashboardStats } = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Admin-only routes
router.get('/all', authMiddleware, roleMiddleware(['admin']), getAllUsers);
router.put('/approve-mentor/:userId', authMiddleware, roleMiddleware(['admin']), approveMentor);
router.delete('/reject-mentor/:userId', authMiddleware, roleMiddleware(['admin']), rejectMentor);
router.delete('/:userId', authMiddleware, roleMiddleware(['admin']), deleteUser);
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getAnalytics);
router.post('/register-mentor', authMiddleware, roleMiddleware(['admin']), registerMentor);

// Mentor routes
router.get('/students', authMiddleware, roleMiddleware(['mentor']), getStudents);
router.get('/mentor/dashboard-stats', authMiddleware, roleMiddleware(['mentor']), getMentorDashboardStats);

module.exports = router;

