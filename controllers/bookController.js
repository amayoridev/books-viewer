const fs = require('fs');
const path = require('path');
const Book = require('../models/Book');
const Comment = require('../models/Comment');
const { requireAuth, requirePermission } = require('../middleware/auth');

const bookController = {
  getBooks: async (req, res) => {
    try {
      const books = await Book.find().populate('uploadedBy', 'username').populate('category', 'name');
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching books' });
    }
  },

  addBook: async (req, res) => {
    const { name, author, description, category } = req.body;
    const pdfFile = req.files?.pdf?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    const pdfDirectory = pdfFile ? `/uploads/pdf/${pdfFile.filename}` : req.body.pdfDirectory;
    const thumbnailDirectory = thumbnailFile ? `/uploads/thumbnail/${thumbnailFile.filename}` : '/uploads/thumbnail/default.jpg';

    if (!pdfFile && !pdfDirectory) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    try {
      const book = new Book({
        name,
        pdfDirectory,
        thumbnailDirectory,
        category: category || undefined,
        author,
        description,
        uploadedBy: req.session.user.id
      });
      await book.save();
      res.status(201).json({ message: 'Book added successfully', book });
    } catch (err) {
      res.status(400).json({ message: 'Error adding book' });
    }
  },

  getBook: async (req, res) => {
    try {
      const book = await Book.findById(req.params.id).populate('uploadedBy', 'username').populate('category', 'name');
      if (!book) return res.status(404).json({ message: 'Book not found' });
      res.json(book);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching book' });
    }
  },

  updateBook: async (req, res) => {
    const { name, author, description, category, pdfDirectory: currentPdfDirectory, thumbnailDirectory: currentThumbnailDirectory } = req.body;
    const pdfFile = req.files?.pdf?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];
    const pdfDirectory = pdfFile ? `/uploads/pdf/${pdfFile.filename}` : currentPdfDirectory;
    const thumbnailDirectory = thumbnailFile ? `/uploads/thumbnail/${thumbnailFile.filename}` : (currentThumbnailDirectory || '/uploads/thumbnail/default.jpg');
    try {
      const book = await Book.findByIdAndUpdate(req.params.id, {
        name,
        pdfDirectory,
        thumbnailDirectory,
        category: category || undefined,
        author,
        description
      }, { new: true });
      if (!book) return res.status(404).json({ message: 'Book not found' });
      res.json({ message: 'Book updated successfully', book });
    } catch (err) {
      res.status(400).json({ message: 'Error updating book' });
    }
  },

  deleteBook: async (req, res) => {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      await Comment.deleteMany({ book: book._id });

      if (book.pdfDirectory) {
        const filePath = path.join(__dirname, '..', 'public', book.pdfDirectory.replace(/^\//, ''));
        if (filePath.startsWith(path.join(__dirname, '..', 'public', 'uploads', 'pdf'))) {
          fs.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
              console.error('Failed to delete PDF file:', err);
            }
          });
        }
      }

      if (book.thumbnailDirectory && book.thumbnailDirectory !== '/uploads/thumbnail/default.jpg') {
        const thumbPath = path.join(__dirname, '..', 'public', book.thumbnailDirectory.replace(/^\//, ''));
        if (thumbPath.startsWith(path.join(__dirname, '..', 'public', 'uploads', 'thumbnail'))) {
          fs.unlink(thumbPath, (err) => {
            if (err && err.code !== 'ENOENT') {
              console.error('Failed to delete thumbnail file:', err);
            }
          });
        }
      }

      res.json({ message: 'Book deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting book' });
    }
  }
};

module.exports = bookController;