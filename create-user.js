const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['New Admin', 'newadmin@twania.com', hashedPassword, 'admin']
    );
    console.log('User created:', result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
  } finally {
    pool.end();
  }
}

createUser();
