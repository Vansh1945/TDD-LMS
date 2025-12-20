const User = require('../models/User');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve mentor (admin only)
const approveMentor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'mentor') {
      return res.status(400).json({ message: 'User is not a mentor' });
    }
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Mentor approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject mentor (admin only)
const rejectMentor = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Mentor rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get analytics data (admin only)
const getAnalytics = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const students = await User.countDocuments({ role: 'student' });
    const mentors = await User.countDocuments({ role: 'mentor' });
    const approvedMentors = await User.countDocuments({ role: 'mentor', isApproved: true });

    // Course statistics
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Chapter statistics
    const totalChapters = await Chapter.countDocuments();

    // Progress statistics
    const totalProgress = await Progress.countDocuments();
    const completedProgress = await Progress.countDocuments({ isCompleted: true });
    const completionRate = totalProgress > 0 ? ((completedProgress / totalProgress) * 100).toFixed(2) : 0;

    // Certificate statistics
    const totalCertificates = await Certificate.countDocuments();

    // Most popular courses (by number of progress records)
    const popularCourses = await Progress.aggregate([
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $project: {
          title: '$course.title',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Recent activity (last 30 days for charts)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newCourses = await Course.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newCertificates = await Certificate.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // User registration trend (last 12 months)
    const userTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Course completion trend (last 12 months)
    const completionTrend = await Progress.aggregate([
      {
        $match: {
          isCompleted: true,
          completedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        students,
        mentors,
        approvedMentors,
        newUsers
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        newCourses,
        completionRate: parseFloat(completionRate),
        popularCourses
      },
      chapters: {
        total: totalChapters
      },
      progress: {
        total: totalProgress,
        completed: completedProgress
      },
      certificates: {
        total: totalCertificates,
        newCertificates
      },
      trends: {
        userRegistrations: userTrend,
        courseCompletions: completionTrend
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students (mentor only)
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Register mentor (admin only)
const registerMentor = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create mentor
    const mentor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'mentor',
      isActive: true,
      isApproved: true
    });

    await mentor.save();

    res.status(201).json({
      message: 'Mentor registered successfully',
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        isApproved: mentor.isApproved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMentorDashboardStats = async (req, res) => {
    try {
      const mentorId = req.user.userId;
  
      // 1. Get courses taught by the mentor
      const courses = await Course.find({ mentorId });
      const courseIds = courses.map(course => course._id);
      const coursesCount = courses.length;
  
      // 2. Get unique assigned students count
      const assignedStudents = await User.find({ role: 'student', assignedCourses: { $in: courseIds } });
      const studentsCount = new Set(assignedStudents.map(student => student._id.toString())).size;
  
      // 3. Get average course progress
      let totalCompletionPercentageSum = 0;
      let studentCourseEnrollments = 0;

      for (const course of courses) {
          const studentsInCourse = await User.find({ role: 'student', assignedCourses: course._id });
          const totalChapters = await Chapter.countDocuments({ courseId: course._id });

          if (totalChapters > 0) {
              for (const student of studentsInCourse) {
                  const completedChapters = await Progress.countDocuments({ studentId: student._id, courseId: course._id, completed: true });
                  const studentProgress = (completedChapters / totalChapters) * 100;
                  totalCompletionPercentageSum += studentProgress;
                  studentCourseEnrollments++;
              }
          }
      }
  
      const averageProgress = studentCourseEnrollments > 0 ? (totalCompletionPercentageSum / studentCourseEnrollments) : 0;
  
      res.json({
        coursesCount,
        studentsCount,
        averageProgress: Math.round(averageProgress),
      });
  
    } catch (error) {
        console.error("Error fetching mentor dashboard stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
  };

module.exports = {
  getAllUsers,
  approveMentor,
  rejectMentor,
  deleteUser,
  getAnalytics,
  getStudents,
  registerMentor,
  getMentorDashboardStats
};
