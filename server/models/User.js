const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student"
    },

    isApproved: {
      type: Boolean,
      default: false
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
