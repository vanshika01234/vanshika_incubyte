const { getDatabase } = require('./database');

class Sweet {
  constructor(id, name, category, price, quantity, createdAt, updatedAt) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.quantity = quantity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all('SELECT * FROM sweets ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const sweets = rows.map(row => new Sweet(
          row.id,
          row.name,
          row.category,
          row.price,
          row.quantity,
          row.created_at,
          row.updated_at
        ));
        
        resolve(sweets);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get('SELECT * FROM sweets WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          resolve(null);
          return;
        }
        
        const sweet = new Sweet(
          row.id,
          row.name,
          row.category,
          row.price,
          row.quantity,
          row.created_at,
          row.updated_at
        );
        
        resolve(sweet);
      });
    });
  }

  static async create(sweetData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const query = `
        INSERT INTO sweets (name, category, price, quantity)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(query, [sweetData.name, sweetData.category, sweetData.price, sweetData.quantity], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        Sweet.findById(this.lastID)
          .then(sweet => resolve(sweet))
          .catch(reject);
      });
    });
  }

  static async updateById(id, updateData) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const query = `
        UPDATE sweets 
        SET name = ?, category = ?, price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(query, [updateData.name, updateData.category, updateData.price, updateData.quantity, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          resolve(null);
          return;
        }
        
        Sweet.findById(id)
          .then(sweet => resolve(sweet))
          .catch(reject);
      });
    });
  }

  static async deleteById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run('DELETE FROM sweets WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(this.changes > 0);
      });
    });
  }

  static async search(filters) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let query = 'SELECT * FROM sweets WHERE 1=1';
      const params = [];
      
      if (filters.name) {
        query += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
      }
      
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }
      
      if (filters.minPrice) {
        query += ' AND price >= ?';
        params.push(filters.minPrice);
      }
      
      if (filters.maxPrice) {
        query += ' AND price <= ?';
        params.push(filters.maxPrice);
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        const sweets = rows.map(row => new Sweet(
          row.id,
          row.name,
          row.category,
          row.price,
          row.quantity,
          row.created_at,
          row.updated_at
        ));
        
        resolve(sweets);
      });
    });
  }

  static async updateQuantity(id, quantityChange) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // First, get current quantity
      db.get('SELECT quantity FROM sweets WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          reject(new Error('Sweet not found'));
          return;
        }
        
        const newQuantity = row.quantity + quantityChange;
        
        if (newQuantity < 0) {
          reject(new Error('Insufficient stock'));
          return;
        }
        
        // Update quantity
        db.run('UPDATE sweets SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
          [newQuantity, id], function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            Sweet.findById(id)
              .then(sweet => resolve(sweet))
              .catch(reject);
          });
      });
    });
  }
}

module.exports = Sweet;