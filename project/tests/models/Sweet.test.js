const Sweet = require('../../models/Sweet');
const { initializeDatabase, closeDatabase } = require('../../models/database');

describe('Sweet Model', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('Create Sweet', () => {
    test('should create a new sweet with valid data', async () => {
      const sweetData = {
        name: 'Test Sweet',
        category: 'Test Category',
        price: 25.50,
        quantity: 10
      };

      const sweet = await Sweet.create(sweetData);

      expect(sweet).toBeDefined();
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
      expect(sweet.id).toBeDefined();
    });

    test('should fail to create sweet with missing data', async () => {
      const sweetData = {
        name: 'Test Sweet',
        // missing category, price, quantity
      };

      await expect(Sweet.create(sweetData)).rejects.toThrow();
    });
  });

  describe('Find Operations', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Find Test Sweet',
        category: 'Test Category',
        price: 30,
        quantity: 15
      });
    });

    test('should find all sweets', async () => {
      const sweets = await Sweet.findAll();
      expect(Array.isArray(sweets)).toBe(true);
      expect(sweets.length).toBeGreaterThan(0);
    });

    test('should find sweet by ID', async () => {
      const sweet = await Sweet.findById(testSweet.id);
      expect(sweet).toBeDefined();
      expect(sweet.id).toBe(testSweet.id);
      expect(sweet.name).toBe(testSweet.name);
    });

    test('should return null for non-existent ID', async () => {
      const sweet = await Sweet.findById(99999);
      expect(sweet).toBeNull();
    });
  });

  describe('Update Operations', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Update Test Sweet',
        category: 'Test Category',
        price: 40,
        quantity: 20
      });
    });

    test('should update sweet successfully', async () => {
      const updateData = {
        name: 'Updated Sweet',
        category: 'Updated Category',
        price: 50,
        quantity: 25
      };

      const updatedSweet = await Sweet.updateById(testSweet.id, updateData);

      expect(updatedSweet).toBeDefined();
      expect(updatedSweet.name).toBe(updateData.name);
      expect(updatedSweet.category).toBe(updateData.category);
      expect(updatedSweet.price).toBe(updateData.price);
      expect(updatedSweet.quantity).toBe(updateData.quantity);
    });

    test('should return null for non-existent ID update', async () => {
      const updateData = {
        name: 'Updated Sweet',
        category: 'Updated Category',
        price: 50,
        quantity: 25
      };

      const result = await Sweet.updateById(99999, updateData);
      expect(result).toBeNull();
    });
  });

  describe('Delete Operations', () => {
    test('should delete sweet successfully', async () => {
      const testSweet = await Sweet.create({
        name: 'Delete Test Sweet',
        category: 'Test Category',
        price: 35,
        quantity: 12
      });

      const deleted = await Sweet.deleteById(testSweet.id);
      expect(deleted).toBe(true);

      const sweet = await Sweet.findById(testSweet.id);
      expect(sweet).toBeNull();
    });

    test('should return false for non-existent ID deletion', async () => {
      const deleted = await Sweet.deleteById(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('Search Operations', () => {
    beforeEach(async () => {
      await Sweet.create({
        name: 'Chocolate Sweet',
        category: 'Chocolate',
        price: 45,
        quantity: 18
      });

      await Sweet.create({
        name: 'Vanilla Sweet',
        category: 'Milk-Based',
        price: 35,
        quantity: 22
      });
    });

    test('should search by name', async () => {
      const sweets = await Sweet.search({ name: 'Chocolate' });
      expect(sweets.length).toBeGreaterThan(0);
      expect(sweets[0].name).toContain('Chocolate');
    });

    test('should search by category', async () => {
      const sweets = await Sweet.search({ category: 'Chocolate' });
      expect(sweets.length).toBeGreaterThan(0);
      expect(sweets[0].category).toBe('Chocolate');
    });

    test('should search by price range', async () => {
      const sweets = await Sweet.search({ minPrice: 30, maxPrice: 50 });
      expect(sweets.length).toBeGreaterThan(0);
      sweets.forEach(sweet => {
        expect(sweet.price).toBeGreaterThanOrEqual(30);
        expect(sweet.price).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Quantity Management', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Quantity Test Sweet',
        category: 'Test Category',
        price: 20,
        quantity: 50
      });
    });

    test('should increase quantity successfully', async () => {
      const updatedSweet = await Sweet.updateQuantity(testSweet.id, 10);
      expect(updatedSweet.quantity).toBe(60);
    });

    test('should decrease quantity successfully', async () => {
      const updatedSweet = await Sweet.updateQuantity(testSweet.id, -15);
      expect(updatedSweet.quantity).toBe(35);
    });

    test('should fail when decreasing quantity below zero', async () => {
      await expect(Sweet.updateQuantity(testSweet.id, -60)).rejects.toThrow('Insufficient stock');
    });

    test('should fail for non-existent sweet', async () => {
      await expect(Sweet.updateQuantity(99999, 10)).rejects.toThrow('Sweet not found');
    });
  });
});