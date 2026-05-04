const bcrypt = require('bcryptjs');
const User = require('../models/User');
const path = require('path');

const authController = {
  getLogin: (req, res) => {
    res.sendFile('public/frontend/index.html', { root: path.join(__dirname, '..') });
  },

  postLogin: async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/?message=Invalid credentials');
    }

    req.session.user = { id: user._id, username: user.username, role: user.role };
    res.redirect('/dashboard');
  },

  postRegister: async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.redirect('/?message=Username and password required');

    try {
      // Check if this is the first user
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? 'admin' : 'user'; // First user is admin

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword, role });
      await user.save();
      res.redirect('/?message=User registered successfully');
    } catch (err) {
      res.redirect('/?message=User already exists');
    }
  },

  postLogout: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Could not log out');
      }
      res.redirect('/');
    });
  }
};

module.exports = authController;