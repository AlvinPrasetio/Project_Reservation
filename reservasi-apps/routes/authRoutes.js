// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    
    // Validasi data
    if (!nama || !email || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    // Cek apakah email sudah terdaftar
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Simpan user ke database
    const [result] = await pool.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, 'user']
    );
    
    // Buat token
    const token = jwt.sign(
      { 
        id: result.insertId,
        email: email, 
        nama: nama,
        role: 'user' 
      }, 
      process.env.JWT_SECRET || 'rahasia123',
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ 
      message: 'User berhasil didaftarkan',
      token,
      user: {
        id: result.insertId,
        nama,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Gagal mendaftarkan user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update user profile
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email, password } = req.body;

    if (!nama && !email && !password) {
      return res.status(400).json({ message: 'Minimal satu field harus diupdate' });
    }

    // Cek apakah email sudah digunakan oleh user lain jika email diupdate
    if (email) {
      const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
      }
    }

    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Update user di database
    const updateFields = [];
    const updateValues = [];

    if (nama) {
      updateFields.push('nama = ?');
      updateValues.push(nama);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (hashedPassword) {
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada data untuk diupdate' });
    }

    updateValues.push(userId);

    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(sql, updateValues);

    // Ambil data user terbaru
    const [rows] = await pool.query('SELECT id, nama, email, role FROM users WHERE id = ?', [userId]);
    const updatedUser = rows[0];

    res.json({
      message: 'Profil berhasil diperbarui',
      user: updatedUser
    });
  } catch (error) {
    console.error('Gagal memperbarui profil:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasi data
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password harus diisi' });
    }
    
    // Cek user di database
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
    
    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
    
    // Buat token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'rahasia123',
      { expiresIn: '1h' }
    );
    
    res.json({ 
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Gagal login:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET all users (hanya untuk admin)
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Filter hanya menampilkan user biasa (bukan admin)
    const [users] = await pool.query('SELECT id, nama, email, role FROM users WHERE role != "admin"');
    res.json(users);
  } catch (error) {
    console.error('Gagal mengambil data users:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// DELETE user (hanya untuk admin)
router.delete('/users/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Periksa jika user yang akan dihapus adalah admin
    const [userRows] = await pool.query('SELECT role FROM users WHERE id = ?', [id]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    // Cegah penghapusan user admin
    if (userRows[0].role === 'admin') {
      return res.status(403).json({ message: 'Tidak dapat menghapus akun admin' });
    }
    
    // Hapus user
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
