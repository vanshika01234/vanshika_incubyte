const request = require('supertest');
const { app } = require('../../server');
const Sweet = require('../../models/Sweet');

describe('Sweet Controller', () => {
  describe('GET /api/sweets', () => {
    test('should return all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/sweets', () => {
    test('should create a new sweet with valid data', async () => {
      const sweetData = {
        name: 'API Test Sweet',
        category: 'Test Category',
        price: 25,
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(sweetData.name);
      expect(response.body.data.category).toBe(sweetData.category);
      expect(response.body.data.price).toBe(sweetData.price);
      expect(response.body.data.quantity).toBe(sweetData.quantity);
    });

    test('should fail with missing required fields', async () => {
      const sweetData = {
        name: 'Incomplete Sweet'
        // missing category, price, quantity
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should fail with negative price', async () => {
      const sweetData = {
        name: 'Negative Price Sweet',
        category: 'Test Category',
        price: -10,
        quantity: 5
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('non-negative');
    });
  });

  describe('GET /api/sweets/:id', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Get Test Sweet',
        category: 'Test Category',
        price: 30,
        quantity: 15
      });
    });

    test('should return sweet by ID', async () => {
      const response = await request(app)
        .get(`/api/sweets/${testSweet.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testSweet.id);
      expect(response.body.data.name).toBe(testSweet.name);
    });

    test('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Sweet not found');
    });
  });

  describe('PUT /api/sweets/:id', () => {
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
        name: 'Updated Sweet Name',
        category: 'Updated Category',
        price: 50,
        quantity: 25
      };

      const response = await request(app)
        .put(`/api/sweets/${testSweet.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.category).toBe(updateData.category);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.quantity).toBe(updateData.quantity);
    });

    test('should return 404 for non-existent sweet', async () => {
      const updateData = {
        name: 'Updated Sweet Name',
        category: 'Updated Category',
        price: 50,
        quantity: 25
      };

      const response = await request(app)
        .put('/api/sweets/99999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Sweet not found');
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Delete Test Sweet',
        category: 'Test Category',
        price: 35,
        quantity: 12
      });
    });

    test('should delete sweet successfully', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${testSweet.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sweet deleted successfully');
    });

    test('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .delete('/api/sweets/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Sweet not found');
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await Sweet.create({
        name: 'Search Test Chocolate',
        category: 'Chocolate',
        price: 45,
        quantity: 18
      });

      await Sweet.create({
        name: 'Search Test Vanilla',
        category: 'Milk-Based',
        price: 35,
        quantity: 22
      });
    });

    test('should search by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Chocolate');
    });

    test('should search by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Chocolate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].category).toBe('Chocolate');
    });

    test('should search by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=30&maxPrice=50')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach(sweet => {
        expect(sweet.price).toBeGreaterThanOrEqual(30);
        expect(sweet.price).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Purchase Test Sweet',
        category: 'Test Category',
        price: 20,
        quantity: 50
      });
    });

    test('should purchase sweet successfully', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet.id}/purchase`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(45);
      expect(response.body.message).toContain('Successfully purchased');
    });

    test('should fail with insufficient stock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet.id}/purchase`)
        .send({ quantity: 100 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient stock available');
    });

    test('should fail with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet.id}/purchase`)
        .send({ quantity: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let testSweet;

    beforeEach(async () => {
      testSweet = await Sweet.create({
        name: 'Restock Test Sweet',
        category: 'Test Category',
        price: 25,
        quantity: 10
      });
    });

    test('should restock sweet successfully', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet.id}/restock`)
        .send({ quantity: 15 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(25);
      expect(response.body.message).toContain('Successfully restocked');
    });

    test('should fail with invalid quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${testSweet.id}/restock`)
        .send({ quantity: -5 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive number');
    });
  });
});