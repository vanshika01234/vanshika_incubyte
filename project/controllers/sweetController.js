const Sweet = require('../models/Sweet');

class SweetController {
  // Get all sweets
  static async getAllSweets(req, res) {
    try {
      const sweets = await Sweet.findAll();
      res.json({
        success: true,
        data: sweets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sweets',
        error: error.message
      });
    }
  }

  // Get sweet by ID
  static async getSweetById(req, res) {
    try {
      const { id } = req.params;
      const sweet = await Sweet.findById(id);
      
      if (!sweet) {
        return res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
      }
      
      res.json({
        success: true,
        data: sweet
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sweet',
        error: error.message
      });
    }
  }

  // Create new sweet
  static async createSweet(req, res) {
    try {
      const { name, category, price, quantity } = req.body;
      
      // Validation
      if (!name || !category || price === undefined || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, price, and quantity are required'
        });
      }
      
      if (price < 0 || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price and quantity must be non-negative'
        });
      }
      
      const sweet = await Sweet.create({ name, category, price, quantity });
      
      res.status(201).json({
        success: true,
        data: sweet,
        message: 'Sweet created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create sweet',
        error: error.message
      });
    }
  }

  // Update sweet
  static async updateSweet(req, res) {
    try {
      const { id } = req.params;
      const { name, category, price, quantity } = req.body;
      
      // Validation
      if (!name || !category || price === undefined || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Name, category, price, and quantity are required'
        });
      }
      
      if (price < 0 || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price and quantity must be non-negative'
        });
      }
      
      const sweet = await Sweet.updateById(id, { name, category, price, quantity });
      
      if (!sweet) {
        return res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
      }
      
      res.json({
        success: true,
        data: sweet,
        message: 'Sweet updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update sweet',
        error: error.message
      });
    }
  }

  // Delete sweet
  static async deleteSweet(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Sweet.deleteById(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Sweet deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete sweet',
        error: error.message
      });
    }
  }

  // Search sweets
  static async searchSweets(req, res) {
    try {
      const { name, category, minPrice, maxPrice } = req.query;
      
      const filters = {};
      if (name) filters.name = name;
      if (category) filters.category = category;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const sweets = await Sweet.search(filters);
      
      res.json({
        success: true,
        data: sweets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to search sweets',
        error: error.message
      });
    }
  }

  // Purchase sweet (decrease quantity)
  static async purchaseSweet(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number'
        });
      }
      
      const sweet = await Sweet.updateQuantity(id, -quantity);
      
      res.json({
        success: true,
        data: sweet,
        message: `Successfully purchased ${quantity} units`
      });
    } catch (error) {
      if (error.message === 'Sweet not found') {
        return res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
      }
      
      if (error.message === 'Insufficient stock') {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to purchase sweet',
        error: error.message
      });
    }
  }

  // Restock sweet (increase quantity)
  static async restockSweet(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number'
        });
      }
      
      const sweet = await Sweet.updateQuantity(id, quantity);
      
      res.json({
        success: true,
        data: sweet,
        message: `Successfully restocked ${quantity} units`
      });
    } catch (error) {
      if (error.message === 'Sweet not found') {
        return res.status(404).json({
          success: false,
          message: 'Sweet not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to restock sweet',
        error: error.message
      });
    }
  }
}

module.exports = SweetController;