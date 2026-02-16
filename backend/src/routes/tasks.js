const express = require('express');
const router = express.Router();
const {
  getTasks, createTask, updateTask, deleteTask, moveTask, assignTask
} = require('../controllers/taskController');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', getTasks);
router.post('/', createTaskValidator, validate, createTask);
router.put('/:id', updateTaskValidator, validate, updateTask);
router.delete('/:id', deleteTask);
router.put('/:id/move', moveTask);
router.put('/:id/assign', assignTask);

module.exports = router;