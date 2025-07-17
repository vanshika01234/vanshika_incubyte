const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.join(__dirname, '../data/sweetshop.db');

let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Create sweets table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS sweets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.run(createTableQuery, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        
        // Insert sample data
        insertSampleData()
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
};

const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    const sampleSweets = [
      { name: 'Kaju Katli', category: 'Nut-Based', price: 50, quantity: 20 },
      { name: 'Gajar Halwa', category: 'Vegetable-Based', price: 30, quantity: 15 },
      { name: 'Gulab Jamun', category: 'Milk-Based', price: 10, quantity: 50 },
      { name: 'Rasgulla', category: 'Milk-Based', price: 15, quantity: 30 },
      { name: 'Barfi', category: 'Nut-Based', price: 45, quantity: 25 }
    ];
    
    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM sweets', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        resolve();
        return;
      }
      
      // Insert sample data
      const insertQuery = `
        INSERT INTO sweets (name, category, price, quantity)
        VALUES (?, ?, ?, ?)
      `;
      
      let completed = 0;
      sampleSweets.forEach(sweet => {
        db.run(insertQuery, [sweet.name, sweet.category, sweet.price, sweet.quantity], (err) => {
          if (err) {
            console.error('Error inserting sample data:', err);
            reject(err);
            return;
          }
          
          completed++;
          if (completed === sampleSweets.length) {
            console.log('Sample data inserted successfully');
            resolve();
          }
        });
      });
    });
  });
};

const getDatabase = () => db;

const closeDatabase = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};