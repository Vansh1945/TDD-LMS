const Chapter = require("../models/Chapter");
const Course = require("../models/Course");

// Create a new chapter
const createChapter = async (req, res) => {
  try {
    const { courseId, title, description, imageUrl, videoUrl, order } = req.body;
    const mentorId = req.user.userId;

    // Validation
    if (!courseId || !title || !description || !videoUrl || order === undefined) {
      return res.status(400).json({ message: "courseId, title, description, videoUrl, and order are required" });
    }

    // Check if course exists and belongs to mentor
    const course = await Course.findOne({ _id: courseId, mentorId });
    if (!course) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    // Check if order is unique for the course
    const existingChapter = await Chapter.findOne({ courseId, order });
    if (existingChapter) {
      return res.status(400).json({ message: "Chapter order must be unique for this course" });
    }

    const chapter = new Chapter({
      courseId,
      title,
      description,
      imageUrl: imageUrl || "",
      videoUrl,
      order,
    });

    await chapter.save();
    res.status(201).json({ message: "Chapter created successfully", chapter });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: "Chapter order must be unique for this course" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get chapters for a course
const getChapters = async (req, res) => {
  try {
    const { courseId } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!courseId) {
      return res.status(400).json({ message: "courseId parameter is required" });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check for access rights
    const isMentor = userRole === 'mentor' && course.mentorId.toString() === userId.toString();
    const isStudent = userRole === 'student' && course.students.some(s => s.toString() === userId.toString());
    const isAdmin = userRole === 'admin'; // Added for admin access

    if (!isMentor && !isStudent && !isAdmin) { // Modified condition
      return res.status(403).json({ message: "Access denied" });
    }

    const chapters = await Chapter.find({ courseId }).sort({ order: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a chapter
const updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, videoUrl, order } = req.body;
    const mentorId = req.user.userId;

    // Find chapter and check ownership via course
    const chapter = await Chapter.findById(id).populate("courseId");
    if (!chapter || chapter.courseId.mentorId.toString() !== mentorId.toString()) {
      return res.status(404).json({ message: "Chapter not found or access denied" });
    }

    // If order is being updated, check uniqueness
    if (order !== undefined && order !== chapter.order) {
      const existingChapter = await Chapter.findOne({ courseId: chapter.courseId._id, order, _id: { $ne: id } });
      if (existingChapter) {
        return res.status(400).json({ message: "Chapter order must be unique for this course" });
      }
    }

    if (title !== undefined) chapter.title = title;
    if (description !== undefined) chapter.description = description;
    if (imageUrl !== undefined) chapter.imageUrl = imageUrl;
    if (videoUrl !== undefined) chapter.videoUrl = videoUrl;
    if (order !== undefined) chapter.order = order;

    await chapter.save();
    res.json({ message: "Chapter updated successfully", chapter });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Chapter order must be unique for this course" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a chapter
const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user._id;

    // Find chapter and check ownership
    const chapter = await Chapter.findById(id).populate("courseId");
    if (!chapter || chapter.courseId.mentorId.toString() !== mentorId.toString()) {
      return res.status(404).json({ message: "Chapter not found or access denied" });
    }

    await Chapter.findByIdAndDelete(id);
    res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createChapter,
  getChapters,
  updateChapter,
  deleteChapter,
};
