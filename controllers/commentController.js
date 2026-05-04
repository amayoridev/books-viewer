const Comment = require('../models/Comment');
const { requireAuth, requirePermission } = require('../middleware/auth');

const commentController = {
  getComments: async (req, res) => {
    try {
      const comments = await Comment.find({ book: req.params.bookId, hidden: false })
        .populate('user', 'username')
        .sort({ createdAt: -1 });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching comments' });
    }
  },

  addComment: async (req, res) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    try {
      const comment = new Comment({
        book: req.params.bookId,
        user: req.session.user.id,
        text: text.trim()
      });
      await comment.save();
      const populatedComment = await Comment.findById(comment._id).populate('user', 'username');
      res.status(201).json(populatedComment);
    } catch (err) {
      res.status(400).json({ message: 'Error adding comment' });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId).populate('user');
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
      const isOwner = comment.user._id.toString() === req.session.user.id;
      const isAdmin = req.session.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }
      await Comment.findByIdAndDelete(req.params.commentId);
      res.json({ message: 'Comment deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting comment' });
    }
  },

  hideComment: async (req, res) => {
    try {
      const isAdmin = req.session.user.role === 'admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      await Comment.findByIdAndUpdate(req.params.commentId, { hidden: true });
      res.json({ message: 'Comment hidden' });
    } catch (err) {
      res.status(500).json({ message: 'Error hiding comment' });
    }
  }
};

module.exports = commentController;