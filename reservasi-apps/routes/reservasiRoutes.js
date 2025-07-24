const express = require('express');
const pool = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'bukti_tf'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const uploadMiddleware = multer({ storage });

// ✅ GET Semua Reservasi
router.get("/", authenticate, async (req, res) => {
  try {
    let query = `
      SELECT reservasi.*, layanan.nama_layanan, layanan.harga, layanan.deskripsi AS layanan_deskripsi
      FROM reservasi
      JOIN layanan ON reservasi.layanan_id = layanan.id
    `;
    let params = [];

    // Jika bukan admin, filter hanya reservasi milik user tersebut
    if (req.user && req.user.role !== "admin") {
      if (!req.user.id) {
        return res.status(400).json({ message: "User ID tidak ditemukan dalam token" });
      }

      query += " WHERE reservasi.user_id = ?";
      params.push(req.user.id);
    }

    query += " ORDER BY reservasi.tanggal_reservasi DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil reservasi:", error);
    res.status(500).json({ message: "Gagal mengambil data reservasi", error: error.message });
  }
});

// ✅ GET Semua Layanan
router.get("/layanan", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT nama_layanan, deskripsi, harga, durasi FROM layanan");
    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil data layanan:", error);
    res.status(500).json({ message: "Gagal mengambil data layanan", error: error.message });
  }
});

// ✅ POST Tambah Reservasi Baru (menangkap jam)
router.post("/", authenticate, async (req, res) => {
  try {
    const { nama, no_hp, tanggal_reservasi, jam, layanan_id, status = "pending" } = req.body;
    const user_id = req.user.id;

    // Validasi input termasuk jam
    if (!nama || !no_hp || !tanggal_reservasi || !jam || !layanan_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      "INSERT INTO reservasi (nama, no_hp, tanggal_reservasi, jam, layanan_id, status, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nama, no_hp, tanggal_reservasi, jam, layanan_id, status, created_at, user_id]
    );

    res.status(201).json({
      message: "Reservasi berhasil dibuat",
      id: result.insertId,
      data: {
        id: result.insertId,
        nama,
        no_hp,
        tanggal_reservasi,
        jam,
        layanan_id,
        status,
        created_at,
        user_id
      }
    });
  } catch (error) {
    console.error("Gagal membuat reservasi:", error);
    res.status(500).json({ message: "Gagal membuat reservasi", error: error.message });
  }
});

// ✅ PUT Update Status Reservasi
router.put("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const [result] = await pool.query(
      "UPDATE reservasi SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    res.json({ message: `Status reservasi berhasil diubah menjadi ${status}` });
  } catch (error) {
    console.error("Gagal mengupdate status reservasi:", error);
    res.status(500).json({ message: "Gagal mengupdate status reservasi" });
  }
});

// ✅ DELETE Reservasi
router.delete("/:id", authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM reservasi WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    res.json({ message: "Reservasi berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus reservasi:", error);
    res.status(500).json({ message: "Gagal menghapus reservasi" });
  }
});

// ✅ PATCH Cancel Reservasi (user can cancel own reservation)
router.patch("/:id/cancel", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if reservation exists and belongs to user
    const [rows] = await pool.query("SELECT * FROM reservasi WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan atau bukan milik Anda" });
    }

    // Update status to 'canceled'
    const [result] = await pool.query("UPDATE reservasi SET status = 'canceled' WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "Gagal membatalkan reservasi" });
    }

    res.json({ message: "Reservasi berhasil dibatalkan" });
  } catch (error) {
    console.error("Gagal membatalkan reservasi:", error);
    res.status(500).json({ message: "Gagal membatalkan reservasi" });
  }
});

router.post('/:id/upload-bukti', uploadMiddleware.single('bukti_transfer'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'File bukti transfer tidak ditemukan.' });
  }

  try {
    const [result] = await pool.query('UPDATE reservasi SET bukti_transfer = ? WHERE id = ?', [file.filename, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    res.json({ message: 'Bukti transfer berhasil diupload.', filename: file.filename });
  } catch (error) {
    console.error('Gagal mengupdate bukti transfer:', error);
    res.status(500).json({ message: 'Gagal mengupdate bukti transfer' });
  }
});

module.exports = router;


// ✅ Endpoint untuk membuat data testing (menangkap jam acak)
router.get("/create-test-data", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email diperlukan untuk membuat data test" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User dengan email tersebut tidak ditemukan" });
    }

    const user = users[0];

    const layananList = [
      { id: 1, nama_layanan: "Facial Treatment" },
      { id: 2, nama_layanan: "Hair Styling" },
      { id: 3, nama_layanan: "Nail Care" },
      { id: 4, nama_layanan: "Facial" },
      { id: 5, nama_layanan: "Creambath" },
      { id: 6, nama_layanan: "Hair Mask" },
      { id: 7, nama_layanan: "Hair Spa" },
      { id: 8, nama_layanan: "Body Massage" },
      { id: 9, nama_layanan: "Body Scrub" },
      { id: 10, nama_layanan: "Rebonding" },
      { id: 11, nama_layanan: "Make Up" }
    ];

    const statusList = ["pending", "confirmed", "canceled"];
    const jamOptions = [
      "08:00:00", "09:00:00", "10:00:00", "11:00:00",
      "12:00:00", "13:00:00", "14:00:00", "15:00:00",
      "16:00:00", "17:00:00", "18:00:00", "19:00:00",
      "20:00:00"
    ];

    const getRandomDate = () => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
      return futureDate.toISOString().split('T')[0];
    };

    const testData = [];

    for (let i = 0; i < 5; i++) {
      const randomLayanan = layananList[Math.floor(Math.random() * layananList.length)];
      const randomStatus = statusList[Math.floor(Math.random() * statusList.length)];
      const randomDate = getRandomDate();
      const randomJam = jamOptions[Math.floor(Math.random() * jamOptions.length)];
      const randomPhone = `08${Math.floor(Math.random() * 1000000000)}`.substring(0, 12);
      const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await pool.query(
        "INSERT INTO reservasi (nama, no_hp, tanggal_reservasi, jam, layanan_id, status, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [user.nama, randomPhone, randomDate, randomJam, randomLayanan.id, randomStatus, created_at, user.id]
      );

      testData.push({
        id: result.insertId,
        nama: user.nama,
        no_hp: randomPhone,
        tanggal_reservasi: randomDate,
        jam: randomJam,
        layanan_id: randomLayanan.id,
        status: randomStatus,
        created_at,
        user_id: user.id
      });
    }

    res.json({
      message: "Data test berhasil dibuat",
      count: testData.length,
      data: testData
    });

  } catch (error) {
    console.error("Gagal membuat data test:", error);
    res.status(500).json({ message: "Gagal membuat data test", error: error.message });
  }
});

router.get("/reserved-jam", authenticate, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Parameter tanggal diperlukan" });
    }

    const [rows] = await pool.query(
      "SELECT jam FROM reservasi WHERE tanggal_reservasi = ? AND status != 'canceled'",
      [date]
    );

    const reservedJam = rows.map(row => row.jam);
    res.json({ reservedJam });
  } catch (error) {
    console.error("Gagal mengambil jam yang sudah dipesan:", error);
    res.status(500).json({ message: "Gagal mengambil jam yang sudah dipesan", error: error.message });
  }
});

module.exports = router;
