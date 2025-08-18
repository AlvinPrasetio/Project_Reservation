const express = require('express');
const cors = require('cors');
const pool = require('../db');
const router = express.Router();

// ✅ GET Layanan Terpopuler berdasarkan jumlah reservasi
router.get("/popular-services", async (req, res) => {
  try {
    const query = `
      SELECT 
        layanan.id,
        layanan.nama_layanan,
        layanan.deskripsi,
        layanan.harga,
        layanan.durasi,
        COUNT(reservasi.id) as total_reservasi
      FROM layanan
      LEFT JOIN reservasi ON layanan.id = reservasi.layanan_id
      WHERE reservasi.status != 'canceled' OR reservasi.status IS NULL
      GROUP BY layanan.id, layanan.nama_layanan, layanan.deskripsi, layanan.harga, layanan.durasi
      ORDER BY total_reservasi DESC
      LIMIT 6
    `;
    
    const [rows] = await req.db.query(query);
    
    // Format response
    const popularServices = rows.map(service => ({
      id: service.id,
      nama_layanan: service.nama_layanan,
      deskripsi: service.deskripsi,
      harga: service.harga,
      durasi: service.durasi,
      total_reservasi: service.total_reservasi || 0
    }));
    
    res.json(popularServices);
  } catch (error) {
    console.error("Gagal mengambil layanan terpopuler:", error);
    res.status(500).json({ message: "Gagal mengambil data layanan terpopuler", error: error.message });
  }
});

module.exports = router;
