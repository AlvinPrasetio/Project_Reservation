// reservasiRoutes.js
const express = require('express');
const pool = require('../db');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ GET Semua Reservasi
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM reservasi";
    let params = [];

    // Jika bukan admin, filter hanya reservasi milik user tersebut
    if (req.user && req.user.role !== "admin") {
      if (!req.user.email && req.user.id) {
        const [userResult] = await pool.query(
          "SELECT email FROM users WHERE id = ?",
          [req.user.id]
        );

        if (userResult && userResult.length > 0) {
          req.user.email = userResult[0].email;
        }
      }

      const userEmail = req.user.email;

      if (userEmail) {
        query += " WHERE email = ?";
        params.push(userEmail);
      }
    }

    query += " ORDER BY tanggal_reservasi DESC";

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error("Gagal mengambil reservasi:", error);
    res.status(500).json({ message: "Gagal mengambil data reservasi", error: error.message });
  }
});

// ✅ POST Tambah Reservasi Baru (menangkap jam)
router.post("/", authenticate, async (req, res) => {
  try {
    const { nama, email, no_hp, tanggal_reservasi, jam, layanan, status = "pending" } = req.body;
    const user_id = req.user.id;

    // Validasi input termasuk jam
    if (!nama || !email || !no_hp || !tanggal_reservasi || !jam || !layanan) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      "INSERT INTO reservasi (nama, email, no_hp, tanggal_reservasi, jam, layanan, status, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [nama, email, no_hp, tanggal_reservasi, jam, layanan, status, created_at, user_id]
    );

    res.status(201).json({
      message: "Reservasi berhasil dibuat",
      id: result.insertId,
      data: {
        id: result.insertId,
        nama,
        email,
        no_hp,
        tanggal_reservasi,
        jam,
        layanan,
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

    const layanan = [
      "Facial Treatment", "Hair Styling", "Nail Care", "Facial",
      "Creambath", "Hair Mask", "Hair Spa", "Body Massage",
      "Body Scrub", "Rebonding", "Make Up"
    ];

    const status = ["pending", "confirmed", "canceled"];
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
      const randomLayanan = layanan[Math.floor(Math.random() * layanan.length)];
      const randomStatus = status[Math.floor(Math.random() * status.length)];
      const randomDate = getRandomDate();
      const randomJam = jamOptions[Math.floor(Math.random() * jamOptions.length)];
      const randomPhone = `08${Math.floor(Math.random() * 1000000000)}`.substring(0, 12);
      const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [result] = await pool.query(
        "INSERT INTO reservasi (nama, email, no_hp, tanggal_reservasi, jam, layanan, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [user.nama, email, randomPhone, randomDate, randomJam, randomLayanan, randomStatus, created_at]
      );

      testData.push({
        id: result.insertId,
        nama: user.nama,
        email,
        no_hp: randomPhone,
        tanggal_reservasi: randomDate,
        jam: randomJam,
        layanan: randomLayanan,
        status: randomStatus,
        created_at
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
