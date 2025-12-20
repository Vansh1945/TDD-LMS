const Course = require("../models/Course");
const User = require("../models/User");
const Chapter = require('../models/Chapter');
const Progress = require('../models/Progress');

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body;
    const mentorId = req.user.userId;

    // Validation
    if (!title || !description || !category || !duration) {
      return res.status(400).json({ message: "Title, description, category, and duration are required" });
    }

    const course = new Course({
      title,
      description,
      category,
      duration,
      mentorId,
    });

    await course.save();
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all courses for the authenticated mentor
const getMentorCourses = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const courses = await Course.find({ mentorId })
      .populate("students");

    res.json(courses);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// Update a course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, duration, isActive } = req.body;
    const mentorId = req.user.userId;

    const course = await Course.findOne({ _id: id, mentorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (duration !== undefined) course.duration = duration;
    if (isActive !== undefined) course.isActive = isActive;

    await course.save();
    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.userId;

    const course = await Course.findOneAndDelete({ _id: id, mentorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign a course to a student
const assignCourseToStudent = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;
    const mentorId = req.user.userId;

    // Check if course belongs to mentor
    const course = await Course.findOne({ _id: courseId, mentorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    // Find all students and validate them
    const students = await User.find({ _id: { $in: studentIds }, role: "student" });
    if (students.length !== studentIds.length) {
      return res.status(404).json({ message: "One or more students not found" });
    }

    // Assign course to each student
    const promises = students.map(async (student) => {
      if (!student.assignedCourses.some(c => c.toString() === courseId)) {
        student.assignedCourses.push(courseId);
        await student.save();
      }
      if (!course.students.includes(student._id)) {
        course.students.push(student._id);
      }
    });

    await Promise.all(promises);
    await course.save();

    res.json({ message: "Course assigned to students successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get courses assigned to the authenticated student
const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const student = await User.findById(studentId).populate({
      path: 'assignedCourses',
      model: 'Course'
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const coursesWithProgress = await Promise.all(
      student.assignedCourses.map(async (course) => {
        const totalChapters = await Chapter.countDocuments({ courseId: course._id });
        const completedChapters = await Progress.countDocuments({
          studentId,
          courseId: course._id,
          completed: true
        });

        const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

        return {
          ...course.toObject(),
          progress: Math.round(progress)
        };
      })
    );

    res.json(coursesWithProgress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all active courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).populate('mentorId', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('mentorId', 'name email');
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCourse,
  getMentorCourses,
  updateCourse,
  deleteCourse,
  assignCourseToStudent,
  getStudentCourses,
  getAllCourses,
  getCourseById,
};
