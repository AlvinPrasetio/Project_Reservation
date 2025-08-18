require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const reservasiRoutes = require('./routes/reservasiRoutes');
const layananRoutes = require('./routes/layananRoutes');
const popularServicesRoutes = require('./routes/popularServicesRoutes');
const pool = require('./db');
const path = require('path');
const { authenticate, authorizeAdmin } = require('./middleware/authMiddleware');
const multer = require('multer');  // Added multer import

const app = express();
const port = process.env.PORT || 5000;

// Multer storage configuration for bukti_tf uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads', 'bukti_tf'));
  },
  filename: function (req, file, cb) {
    // Use timestamp + original filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors({
  origin: '*', // Memperbolehkan semua origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Pasang pool ke request
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Route statis untuk file upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes auth
app.use('/auth', authRoutes);

// Routes reservasi
app.use('/reservasi', reservasiRoutes);

// Routes layanan
app.use('/layanan', layananRoutes);

// Routes popular services
app.use('/popular-services', popularServicesRoutes);

// Mount layanan route separately without prefix
app.get('/layanan', async (req, res) => {
  try {
    const [rows] = await req.db.query("SELECT nama_layanan, deskripsi, harga, durasi FROM layanan");
    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil data layanan:", error);
    res.status(500).json({ message: "Gagal mengambil data layanan", error: error.message });
  }
});

// ✅ Endpoint detail reservasi by ID
app.get('/reservasi/:id', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM reservasi WHERE id = ?', [req.params.id]);
    rows.length
      ? res.json(rows[0])
      : res.status(404).json({ message: 'Reservasi tidak ditemukan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// ✅ Endpoint update reservasi (termasuk jam)
app.put('/reservasi/:id', async (req, res) => {
  const { nama, email, no_hp, tanggal_reservasi, jam, layanan } = req.body;

  // Validasi wajib isi jam juga
  if (!nama || !email || !no_hp || !tanggal_reservasi || !jam || !layanan) {
    return res.status(400).json({ message: "Semua field harus diisi termasuk jam" });
  }

  try {
    const [result] = await req.db.query(
      'UPDATE reservasi SET nama=?, email=?, no_hp=?, tanggal_reservasi=?, jam=?, layanan=? WHERE id=?',
      [nama, email, no_hp, tanggal_reservasi, jam, layanan, req.params.id]
    );

    result.affectedRows
      ? res.json({ message: 'Reservasi berhasil diperbarui' })
      : res.status(404).json({ message: 'Reservasi tidak ditemukan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui reservasi' });
  }
});

// ✅ Route update status reservasi (tidak perlu jam)
app.put(
  '/reservasi/:id/status',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    try {
      const [result] = await req.db.query(
        'UPDATE reservasi SET status = ? WHERE id = ?',
        [status, id]
      );
      if (!result.affectedRows) return res.status(404).json({ message: 'Reservasi tidak ditemukan' });

      return res.json({ message: `Reservasi berhasil diupdate ke status ${status}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error server' });
    }
  }
);

// ✅ Endpoint delete reservasi
app.delete('/reservasi/:id', async (req, res) => {
  try {
    const [result] = await req.db.query('DELETE FROM reservasi WHERE id=?', [req.params.id]);
    result.affectedRows
      ? res.json({ message: 'Reservasi berhasil dihapus' })
      : res.status(404).json({ message: 'Reservasi tidak ditemukan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus reservasi' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
