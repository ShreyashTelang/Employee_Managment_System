const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");

const router = express.Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function handleDatabaseError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({ message: "An employee with this email already exists." });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      message: "Employee data is invalid.",
      errors: Object.values(error.errors || {}).map((item) => item.message)
    });
  }

  console.error(error);
  return res.status(500).json({ message: "An unexpected server error occurred." });
}

router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Employee ID is invalid." });
  }

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json(employee);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create({
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      designation: req.body.designation,
      salary: req.body.salary
    });
    res.status(201).json(employee);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Employee ID is invalid." });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        designation: req.body.designation,
        salary: req.body.salary
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json(employee);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.patch("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Employee ID is invalid." });
  }

  const updates = {};
  for (const field of ["name", "email", "department", "designation", "salary"]) {
    if (Object.hasOwn(req.body, field)) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide at least one employee field to update." });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json(employee);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Employee ID is invalid." });
  }

  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    res.json({ message: "Employee deleted successfully.", employee });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

module.exports = router;
