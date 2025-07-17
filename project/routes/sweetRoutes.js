const express = require('express');
const SweetController = require('../controllers/sweetController');

const router = express.Router();

// Get all sweets
router.get('/', SweetController.getAllSweets);

// Search sweets
router.get('/search', SweetController.searchSweets);

// Get sweet by ID
router.get('/:id', SweetController.getSweetById);

// Create new sweet
router.post('/', SweetController.createSweet);

// Update sweet
router.put('/:id', SweetController.updateSweet);

// Delete sweet
router.delete('/:id', SweetController.deleteSweet);

// Purchase sweet
router.post('/:id/purchase', SweetController.purchaseSweet);

// Restock sweet
router.post('/:id/restock', SweetController.restockSweet);

module.exports = router;