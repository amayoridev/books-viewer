const express = require('express');
const commentController = require('../controllers/commentController');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/:bookId', commentController.getComments);
router.post('/:bookId', requireAuth, commentController.addComment);
router.delete('/:commentId', requireAuth, commentController.deleteComment);
router.put('/:commentId/hide', requireAuth, requirePermission('moderate'), commentController.hideComment);

module.exports = router;