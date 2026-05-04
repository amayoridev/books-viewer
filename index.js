const express = require('express');
const session = require('express-session');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const { requireAuth } = require('./middleware/auth');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
fs.mkdirSync(path.join(__dirname, 'public', 'uploads', 'pdf'), { recursive: true });
fs.mkdirSync(path.join(__dirname, 'public', 'uploads', 'thumbnail'), { recursive: true });

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'supergay@@@#$@@', // Change this in production
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);

// Static files
app.use(express.static('public'));

// Public homepage
app.get('/home', (req, res) => {
  res.sendFile('views/home.html', { root: __dirname });
});

// Book details page
app.get('/book/:id', (req, res) => {
  res.sendFile('views/book.html', { root: __dirname });
});

// Protected routes
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile('views/dashboard.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
