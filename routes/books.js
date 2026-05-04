const express = require('express');
const multer = require('multer');
const path = require('path');
const bookController = require('../controllers/bookController');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === 'pdf' ? 'pdf' : 'thumbnail';
      cb(null, path.join(__dirname, '..', 'public', 'uploads', folder));
    },
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      cb(null, safeName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBook);
router.use(requireAuth);
router.post('/', requirePermission('upload'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), bookController.addBook);
router.post('/upload', requirePermission('upload'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), bookController.addBook);
router.put('/:id', requirePermission('upload'), upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), bookController.updateBook);
router.delete('/:id', requirePermission('delete'), bookController.deleteBook);

module.exports = router;