const { body } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title is required (max 200 chars)'),
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
];

const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
];

module.exports = { createTaskValidator, updateTaskValidator };