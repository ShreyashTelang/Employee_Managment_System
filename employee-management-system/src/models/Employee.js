const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."]
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."]
    },
    department: {
      type: String,
      required: [true, "Department is required."],
      trim: true,
      maxlength: [100, "Department cannot exceed 100 characters."]
    },
    designation: {
      type: String,
      required: [true, "Designation is required."],
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters."]
    },
    salary: {
      type: Number,
      required: [true, "Salary is required."],
      min: [0, "Salary cannot be negative."]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
