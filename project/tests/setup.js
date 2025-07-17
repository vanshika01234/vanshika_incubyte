const { beforeAll, afterAll } = require('@jest/globals');
const { initializeDatabase, closeDatabase } = require('../models/database');

// Setup before all tests
beforeAll(async () => {
  await initializeDatabase();
});

// Cleanup after all tests
afterAll(async () => {
  await closeDatabase();
});