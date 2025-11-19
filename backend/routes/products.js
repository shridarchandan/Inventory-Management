const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message?.includes('connect')) {
      res.status(503).json({ 
        error: 'Database connection failed', 
        message: 'Please ensure PostgreSQL is running and the database is set up. See SETUP_DATABASE.md for instructions.' 
      });
    } else {
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.getByCategory(req.params.categoryId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET low stock products
router.get('/low-stock/:threshold?', async (req, res) => {
  try {
    const threshold = parseInt(req.params.threshold) || 10;
    const products = await Product.getLowStock(threshold);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, quantity, sku, category_id, supplier_id } = req.body;
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }
    const product = await Product.create({ name, description, price, quantity, sku, category_id, supplier_id });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Product with this SKU already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid category or supplier ID' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// UPDATE product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, quantity, sku, category_id, supplier_id } = req.body;
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }
    if (price < 0 || quantity < 0) {
      return res.status(400).json({ error: 'Price and quantity must be non-negative' });
    }
    const product = await Product.update(req.params.id, { name, description, price, quantity, sku, category_id, supplier_id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Product with this SKU already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid category or supplier ID' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.delete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

