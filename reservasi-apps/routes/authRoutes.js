// authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Lupa Password - kirim email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email harus diisi' });
    }
    
    // Cek apakah email terdaftar
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'Email tidak terdaftar' });
    }
    
    // Generate token reset password
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token berlaku 1 jam
    
    // Simpan token ke database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email]
    );
    
    // Konfigurasi transporter email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'liaperwatankulit@gmail.com', // gunakan variabel lingkungan
        pass: process.env.EMAIL_PASS || 'zpvkpdpdujogdvus'  // gunakan variabel lingkungan
      }
    });
    
    // URL reset password di frontend
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // Template email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'liaperwatankulit@gmail.com',
      to: email,
      subject: 'Reset Password - Lia Perawatan Kulit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #5564eb;">Reset Password</h2>
          <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password untuk akun Anda di Lia Perawatan Kulit.</p>
          <p>Silakan klik tombol di bawah untuk mengatur ulang password Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #5564eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda tidak akan berubah.</p>
          <p>Link ini akan kadaluarsa dalam 1 jam.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eaeaea;" />
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Lia Perawatan Kulit. All rights reserved.</p>
        </div>
      `
    };
    
    // Kirim email
    await transporter.sendMail(mailOptions);
    
    res.json({ message: 'Email reset password berhasil dikirim' });
    
  } catch (error) {
    console.error('Gagal mengirim email reset password:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Reset Password dengan token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password harus diisi' });
    }
    
    // Cek apakah token valid dan belum kadaluarsa
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }
    
    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update password dan hapus token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
      [hashedPassword, token]
    );
    
    res.json({ message: 'Password berhasil diubah' });
    
  } catch (error) {
    console.error('Gagal reset password:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Verifikasi token reset password
router.get('/verify-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Cek apakah token valid dan belum kadaluarsa
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
    }
    
    res.json({ message: 'Token valid', valid: true });
    
  } catch (error) {
    console.error('Gagal verifikasi token:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
