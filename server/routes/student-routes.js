const express = require("express");
const router = express.Router();
const chapterController = require("../controllers/chapter-controller");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.use(authMiddleware);
router.use(roleMiddleware(["student"]));

router.get("/chapters/:courseId", chapterController.getChapters);

module.exports = router;
