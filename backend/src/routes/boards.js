const express = require('express');
const router = express.Router();
const {
  getBoards, getBoard, createBoard, updateBoard, deleteBoard,
  addMember, removeMember
} = require('../controllers/boardController');
const { createBoardValidator, updateBoardValidator } = require('../validators/boardValidator');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getBoards);
router.post('/', createBoardValidator, validate, createBoard);
router.get('/:id', getBoard);
router.put('/:id', updateBoardValidator, validate, updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;