const pool = require('../database/db');

class Supplier {
  static async getAll() {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(supplierData) {
    const { name, email, phone, address } = supplierData;
    const result = await pool.query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    return result.rows[0];
  }

  static async update(id, supplierData) {
    const { name, email, phone, address } = supplierData;
    const result = await pool.query(
      'UPDATE suppliers SET name = $1, email = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, email, phone, address, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

module.exports = Supplier;


