const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Public route for all authenticated users
router.get("/", courseController.getAllCourses);

// Student routes
router.get("/student-courses", roleMiddleware(["student"]), courseController.getStudentCourses);
router.get("/:id", roleMiddleware(["student"]), courseController.getCourseById);

// Mentor routes
router.post("/create-course", roleMiddleware(["mentor"]), courseController.createCourse);
router.get("/mentor", roleMiddleware(["mentor"]), courseController.getMentorCourses);
router.put("/update-course/:id", roleMiddleware(["mentor"]), courseController.updateCourse);
router.delete("/delete-course/:id", roleMiddleware(["mentor"]), courseController.deleteCourse);
router.post("/assign", roleMiddleware(["mentor"]), courseController.assignCourseToStudent);

module.exports = router;

