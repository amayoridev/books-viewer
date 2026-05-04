const Category = require('../models/Category');

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find().sort('name');
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching categories' });
    }
  },

  addCategory: async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      const category = new Category({ name: name.trim(), slug });
      await category.save();
      res.status(201).json({ message: 'Category created', category });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Category already exists' });
      }
      res.status(500).json({ message: 'Error creating category' });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      res.json({ message: 'Category deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting category' });
    }
  }
};

module.exports = categoryController;