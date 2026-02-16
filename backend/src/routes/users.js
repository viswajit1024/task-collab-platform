const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.use(auth);
router.get('/search', searchUsers);

module.exports = router;