const pool = require('../database/db');

class User {
  static async create({ name, email, passwordHash, role = 'staff' }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, passwordHash, role]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async updatePasswordByEmail(email, passwordHash) {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $2
       RETURNING id, name, email, role, created_at, updated_at`,
      [passwordHash, email]
    );
    return result.rows[0];
  }
}

module.exports = User;


