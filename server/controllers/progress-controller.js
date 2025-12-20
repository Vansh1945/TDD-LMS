const Progress = require("../models/Progress");
const Chapter = require("../models/Chapter");
const Course = require("../models/Course");
const User = require("../models/User");

// Get progress for a student in a course
const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const loggedInUserId = req.user.userId;
    const loggedInUserRole = req.user.role;

    if (!courseId) {
      return res.status(400).json({ message: "courseId parameter is required" });
    }

    // Determine which student's progress to fetch
    let targetStudentId;
    if (loggedInUserRole === 'student') {
      targetStudentId = loggedInUserId;
    } else if (loggedInUserRole === 'mentor' || loggedInUserRole === 'admin') {
      // Mentor or Admin can specify a studentId in query
      targetStudentId = req.query.studentId || loggedInUserId; // Default to own progress if no studentId specified
    } else {
      return res.status(403).json({ message: "Access denied: Invalid user role" });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Authorization checks
    if (loggedInUserRole === 'student') {
      // Student can only view their own progress and must be enrolled
      if (targetStudentId.toString() !== loggedInUserId.toString() || !course.students.includes(targetStudentId)) {
        return res.status(403).json({ message: "Access denied: Student can only view their own enrolled course progress" });
      }
    } else if (loggedInUserRole === 'mentor') {
      // Mentor can view progress for students in their courses
      if (course.mentorId.toString() !== loggedInUserId.toString()) {
        return res.status(403).json({ message: "Access denied: Mentor can only view progress for their own courses" });
      }
      // If a studentId is specified, ensure that student is assigned to this mentor's course
      if (req.query.studentId && !course.students.map(id => id.toString()).includes(targetStudentId.toString())) {
         return res.status(403).json({ message: "Access denied: Specified student is not enrolled in this course" });
      }
    } else if (loggedInUserRole === 'admin') {
      // Admin can view any progress, no further course specific checks needed
      // If a studentId is specified, ensure that student exists
      const studentExists = await User.findById(targetStudentId);
      if (!studentExists || studentExists.role !== 'student') {
          return res.status(404).json({ message: "Student not found or not a student" });
      }
    } else {
      return res.status(403).json({ message: "Access denied: Invalid user role" });
    }


    // Get all progress for this student and course
    const progress = await Progress.find({ studentId: targetStudentId, courseId }).populate("chapterId");

    // Get total chapters in the course
    const totalChapters = await Chapter.countDocuments({ courseId });

    // Calculate completion percentage
    const completedChapters = progress.filter(p => p.completed).length;
    const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    res.json({
      courseId,
      progress,
      totalChapters,
      completedChapters,
      completionPercentage
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark a chapter as completed
const markChapterCompleted = async (req, res) => {
  try {
    const { chapterId } = req.body;
    const studentId = req.user.userId;

    if (!chapterId) {
      return res.status(400).json({ message: "chapterId is required" });
    }

    // Find the chapter and its course
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const courseId = chapter.courseId;

    // Check if student is enrolled in the course
    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);
    if (!student || !student.assignedCourses.some(c => c.toString() === courseId)) {
      return res.status(403).json({ message: "Access denied: Not enrolled in this course" });
    }

    // Get all chapters in the course sorted by order
    const allChapters = await Chapter.find({ courseId }).sort({ order: 1 });

    // Find the index of the chapter to complete
    const chapterIndex = allChapters.findIndex(c => c._id.toString() === chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({ message: "Chapter not found in course" });
    }

    // Check sequential completion: all previous chapters must be completed
    for (let i = 0; i < chapterIndex; i++) {
      const prevChapter = allChapters[i];
      const prevProgress = await Progress.findOne({ studentId, chapterId: prevChapter._id });
      if (!prevProgress || !prevProgress.completed) {
        return res.status(400).json({ message: `Cannot complete this chapter. Chapter "${prevChapter.title}" (order ${prevChapter.order}) must be completed first.` });
      }
    }

    // Check if already completed
    let progress = await Progress.findOne({ studentId, chapterId });
    if (progress && progress.completed) {
      return res.status(400).json({ message: "Chapter already completed" });
    }

    // Mark as completed
    if (!progress) {
      progress = new Progress({
        studentId,
        courseId,
        chapterId,
        completed: true,
        completedAt: new Date()
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json({ message: "Chapter marked as completed", progress });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: "Progress already exists for this student and chapter" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get progress for all students in mentor's courses
const getMentorProgress = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    // Get all courses by mentor
    const courses = await Course.find({ mentorId });

    const progressData = [];

    for (const course of courses) {
      // Get students assigned to this course
      const students = await User.find({ assignedCourses: course._id, role: 'student' }).select('name email');

      for (const student of students) {
        // Get progress for this student in this course
        const progress = await Progress.find({ studentId: student._id, courseId: course._id }).populate("chapterId");

        // Get total chapters in the course
        const totalChapters = await Chapter.countDocuments({ courseId: course._id });

        // Calculate completion percentage
        const completedChapters = progress.filter(p => p.completed).length;
        const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

        progressData.push({
          student: {
            _id: student._id,
            name: student.name,
            email: student.email
          },
          course: {
            _id: course._id,
            title: course.title
          },
          progress: {
            completedChapters,
            totalChapters,
            completionPercentage,
            details: progress
          }
        });
      }
    }

    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark a chapter as completed for a student by mentor
const markChapterCompletedForStudent = async (req, res) => {
  try {
    const { studentId, chapterId } = req.body;
    const mentorId = req.user.userId;

    if (!studentId || !chapterId) {
      return res.status(400).json({ message: "studentId and chapterId are required" });
    }

    // Find the chapter and its course
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const courseId = chapter.courseId;

    // Check if mentor is assigned to the course
    const course = await Course.findById(courseId);
    if (!course || course.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ message: "Access denied: Not the mentor for this course" });
    }

    // Check if student is assigned to the course
    const student = await User.findById(studentId);
    if (!student || !student.assignedCourses.some(c => c.toString() === courseId)) {
      return res.status(403).json({ message: "Student not assigned to this course" });
    }

    // Get all chapters in the course sorted by order
    const allChapters = await Chapter.find({ courseId }).sort({ order: 1 });

    // Find the index of the chapter to complete
    const chapterIndex = allChapters.findIndex(c => c._id.toString() === chapterId);
    if (chapterIndex === -1) {
      return res.status(404).json({ message: "Chapter not found in course" });
    }

    // Check sequential completion: all previous chapters must be completed
    for (let i = 0; i < chapterIndex; i++) {
      const prevChapter = allChapters[i];
      const prevProgress = await Progress.findOne({ studentId, chapterId: prevChapter._id });
      if (!prevProgress || !prevProgress.completed) {
        return res.status(400).json({ message: `Cannot complete this chapter. Chapter "${prevChapter.title}" (order ${prevChapter.order}) must be completed first.` });
      }
    }

    // Check if already completed
    let progress = await Progress.findOne({ studentId, chapterId });
    if (progress && progress.completed) {
      return res.status(400).json({ message: "Chapter already completed" });
    }

    // Mark as completed
    if (!progress) {
      progress = new Progress({
        studentId,
        courseId,
        chapterId,
        completed: true,
        completedAt: new Date()
      });
    } else {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json({ message: "Chapter marked as completed for student", progress });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: "Progress already exists for this student and chapter" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProgress,
  markChapterCompleted,
  getMentorProgress,
  markChapterCompletedForStudent,
};
