const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },

    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    completed: {
      type: Boolean,
      default: false
    },

    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/**
 * Prevent duplicate progress entries
 * (One student can complete one chapter only once)
 */
progressSchema.index(
  { studentId: 1, chapterId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Progress", progressSchema);
