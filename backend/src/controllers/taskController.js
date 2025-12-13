const { validationResult } = require('express-validator');
const Task = require('../models/Task');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.status = 422;
    error.details = errors.array();
    throw error;
  }
};

const buildFilter = (req) => {
  const filter = {};
  if (!(req.user.role === 'admin' && req.query.scope === 'all')) {
    filter.owner = req.user._id;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  return filter;
};

const listTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find(buildFilter(req)).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    handleValidation(req);
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      owner: req.user._id,
    });
    return res.status(201).json({ task });
  } catch (err) {
    return next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    handleValidation(req);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    handleValidation(req);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const updates = ['title', 'description', 'status', 'dueDate'];
    updates.forEach((key) => {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    });
    await task.save();
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    handleValidation(req);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await task.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask };


