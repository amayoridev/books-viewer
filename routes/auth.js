const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);
router.post('/logout', authController.postLogout);
router.get('/api/user', requireAuth, (req, res) => {
  res.json({ id: req.session.user.id, username: req.session.user.username, role: req.session.user.role });
});

module.exports = router;