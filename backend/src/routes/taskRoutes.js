const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(authenticate);

router.get('/', listTasks);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  createTask
);

router.get('/:id', [param('id').isMongoId()], getTask);

router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().notEmpty(),
    body('description').optional().isString(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  updateTask
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('status').optional().isIn(['todo', 'in-progress', 'done']),
    body('dueDate').optional().isISO8601().toDate(),
  ],
  updateTask
);

router.delete('/:id', [param('id').isMongoId()], deleteTask);

module.exports = router;


