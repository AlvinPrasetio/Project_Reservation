// db.js - Koneksi database untuk aplikasi reservasi salon
require('dotenv').config();
const mysql = require('mysql2/promise');

// Konfigurasi koneksi database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'reservasi_salon',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool; 