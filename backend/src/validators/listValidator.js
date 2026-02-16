const { body } = require('express-validator');

const createListValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('List title is required (max 100 chars)'),
  body('boardId')
    .isMongoId()
    .withMessage('Valid board ID is required')
];

const updateListValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
];

module.exports = { createListValidator, updateListValidator };