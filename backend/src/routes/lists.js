const express = require('express');
const router = express.Router();
const { createList, updateList, deleteList, reorderLists } = require('../controllers/listController');
const { createListValidator, updateListValidator } = require('../validators/listValidator');
const { validate } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/', createListValidator, validate, createList);
router.put('/reorder', reorderLists);
router.put('/:id', updateListValidator, validate, updateList);
router.delete('/:id', deleteList);

module.exports = router;