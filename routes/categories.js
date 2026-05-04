const express = require('express');
const categoryController = require('../controllers/categoryController');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.use(requireAuth);
router.post('/', requirePermission('manage'), categoryController.addCategory);
router.delete('/:id', requirePermission('manage'), categoryController.deleteCategory);

module.exports = router;