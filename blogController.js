const Blog = require('../models/Blog');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username')
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .populate('category', 'name');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private (authenticated authors)
exports.createBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, category } = req.body;

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Create new blog
    const blog = await Blog.create({
      title,
      content,
      category,
      author: req.user.id
    });

    // Populate author and category information
    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username')
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      data: populatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (original author or admin)
exports.updateBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, category } = req.body;

    // Check if blog exists
    let blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if category exists if updating
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Update blog
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content, 
        category,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    )
    .populate('author', 'username')
    .populate('category', 'name');

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (original author or admin)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:categoryId
// @access  Public
exports.getBlogsByCategory = async (req, res) => {
  try {
    // Check if category exists
    const categoryExists = await Category.findById(req.params.categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const blogs = await Blog.find({ category: req.params.categoryId })
      .populate('author', 'username')
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};