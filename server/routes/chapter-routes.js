const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Mentor-only routes
router.post("/create-chapter", roleMiddleware(["mentor"]), chapterController.createChapter);

// Shared routes (mentors and students)
router.get("/get-chapters", chapterController.getChapters);

module.exports = router;
