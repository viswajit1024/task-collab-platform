const { body, param } = require('express-validator');

const createBoardValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title is required (max 100 chars)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description max 500 chars'),
  body('background')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Invalid color format')
];

const updateBoardValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title max 100 chars'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('background')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
];

module.exports = { createBoardValidator, updateBoardValidator };