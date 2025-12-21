const express = require("express");
const router = express.Router();

const courseController = require("../controllers/course-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

/* ================= AUTH REQUIRED FOR ALL ================= */
router.use(authMiddleware);

/* ================= COMMON ROUTES ================= */
router.get("/", courseController.getAllCourses);

/* ================= STUDENT ROUTES ================= */
router.get(
  "/student-courses",
  roleMiddleware(["student"]),
  courseController.getStudentCourses
);

/* ================= MENTOR ROUTES ================= */
router.post(
  "/create-course",
  roleMiddleware(["mentor"]),
  courseController.createCourse
);

router.get(
  "/mentor",
  roleMiddleware(["mentor"]),
  courseController.getMentorCourses
);

router.put(
  "/update-course/:id",
  roleMiddleware(["mentor"]),
  courseController.updateCourse
);

router.delete(
  "/delete-course/:id",
  roleMiddleware(["mentor"]),
  courseController.deleteCourse
);

router.post(
  "/assign",
  roleMiddleware(["mentor"]),
  courseController.assignCourseToStudent
);

/* ================= STUDENT COURSE DETAIL (KEEP LAST) ================= */
router.get(
  "/:id",
  roleMiddleware(["student", "mentor"]),
  courseController.getCourseById
);

module.exports = router;
