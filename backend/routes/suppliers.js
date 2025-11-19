const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// GET all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.json(suppliers);
  } catch (error) {
    console.error('Suppliers GET error:', error);
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

// GET supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE new supplier
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const supplier = await Supplier.create({ name, email, phone, address });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE supplier
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const supplier = await Supplier.update(req.params.id, { name, email, phone, address });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.delete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully', supplier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

