const express = require('express');
const pool = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/layanan';
    // Pastikan direktori upload ada
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'layanan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: function(req, file, cb) {
    // Hanya izinkan file gambar
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Hanya file gambar (jpg, jpeg, png, gif) yang diizinkan!"));
  }
});

// GET semua layanan
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM layanan');
    res.json(rows);
  } catch (error) {
    console.error('Error mengambil layanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET layanan by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM layanan WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error mengambil detail layanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST tambah layanan baru (Admin only) dengan upload gambar
router.post('/', authenticate, authorizeAdmin, upload.single('gambar'), async (req, res) => {
  try {
    const { nama_layanan, deskripsi, harga, durasi } = req.body;
    
    if (!nama_layanan || !harga) {
      return res.status(400).json({ message: 'Nama layanan dan harga wajib diisi' });
    }
    
    let gambar_url = null;
    if (req.file) {
      // Jika ada file yang diupload, simpan path relatifnya
      gambar_url = `/uploads/layanan/${req.file.filename}`;
    }
    
    const [result] = await pool.query(
      'INSERT INTO layanan (nama_layanan, deskripsi, harga, durasi, gambar_url) VALUES (?, ?, ?, ?, ?)',
      [nama_layanan, deskripsi, harga, durasi, gambar_url]
    );
    
    res.status(201).json({ 
      message: 'Layanan berhasil ditambahkan',
      id: result.insertId,
      gambar_url
    });
  } catch (error) {
    console.error('Error menambahkan layanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update layanan (Admin only) dengan upload gambar
router.put('/:id', authenticate, authorizeAdmin, upload.single('gambar'), async (req, res) => {
  try {
    const { nama_layanan, deskripsi, harga, durasi } = req.body;
    const { id } = req.params;
    
    if (!nama_layanan || !harga) {
      return res.status(400).json({ message: 'Nama layanan dan harga wajib diisi' });
    }
    
    // Cek apakah layanan ada
    const [layanan] = await pool.query('SELECT * FROM layanan WHERE id = ?', [id]);
    if (layanan.length === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    let gambar_url = layanan[0].gambar_url; // Gunakan gambar yang ada jika tidak ada yang baru
    
    if (req.file) {
      // Jika ada file baru, update path gambar
      gambar_url = `/uploads/layanan/${req.file.filename}`;
      
      // Hapus gambar lama jika ada
      if (layanan[0].gambar_url) {
        const oldImagePath = path.join(__dirname, '..', layanan[0].gambar_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const [result] = await pool.query(
      'UPDATE layanan SET nama_layanan = ?, deskripsi = ?, harga = ?, durasi = ?, gambar_url = ? WHERE id = ?',
      [nama_layanan, deskripsi, harga, durasi, gambar_url, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    res.json({ 
      message: 'Layanan berhasil diperbarui',
      gambar_url
    });
  } catch (error) {
    console.error('Error memperbarui layanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE hapus layanan (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah layanan digunakan dalam reservasi
    const [reservations] = await pool.query('SELECT id FROM reservasi WHERE layanan_id = ?', [id]);
    
    if (reservations.length > 0) {
      return res.status(400).json({ 
        message: 'Layanan tidak dapat dihapus karena masih digunakan dalam reservasi' 
      });
    }
    
    // Ambil informasi gambar sebelum menghapus
    const [layanan] = await pool.query('SELECT gambar_url FROM layanan WHERE id = ?', [id]);
    
    if (layanan.length > 0 && layanan[0].gambar_url) {
      // Hapus file gambar jika ada
      const imagePath = path.join(__dirname, '..', layanan[0].gambar_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    const [result] = await pool.query('DELETE FROM layanan WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    console.error('Error menghapus layanan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve gambar layanan
router.use('/uploads/layanan', express.static(path.join(__dirname, '..', 'uploads/layanan')));

module.exports = router; 