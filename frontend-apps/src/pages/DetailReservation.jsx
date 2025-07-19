// src/pages/DetailReservasi.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/DetailReservasi.css";

const servicePrices = {
  "Facial": 125000,
  "Creambath": 85000,
  "Hair Mask": 100000,
  "Hair Spa": 100000,
  "Body Scrub": 100000,
  "Rebonding": 350000,
  "Smoothing": 320000,
  "Make Up": 150000,
  "Hair Coloring": 200000
};

const DetailReservasi = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState(state?.reservation || state?.selectedReservation || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reservation) {
      setLoading(true);
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/reservasi/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch reservation");
          }
          return res.json();
        })
        .then((data) => {
          setReservation(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          navigate("/users");
        });
    }
  }, [id, reservation, navigate]);

  useEffect(() => {
    if (!reservation && !loading) {
      navigate("/users");
    }
  }, [reservation, loading, navigate]);

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="detail-container">Memuat data...</div>;
  }

  if (!reservation) {
    return null;
  }

  const harga = servicePrices[reservation.layanan] || "Belum ditentukan";

  return (
    <div className="detail-container">
      <h2>Detail Pemesanan</h2>
      <div className="detail-box">
        <p><strong>Nama   :</strong> {reservation.nama}</p>
        <p><strong>Layanan:</strong> {reservation.layanan}</p>
        <p><strong>Tanggal:</strong> {formatTanggal(reservation.tanggal_reservasi)}</p>
        <p><strong>Jam    :</strong> {reservation.jam}</p>
        <p><strong>No HP  :</strong> {reservation.no_hp}</p>
        <p><strong>Harga  :</strong> {typeof harga === "number" ? `Rp ${harga.toLocaleString('id-ID')}` : harga}</p>
        <p><strong>Status :</strong> {reservation.status}</p>
      </div>
      <button className="btn-back" onClick={() => navigate("/users")}>Kembali</button>
    </div>
  );
};

export default DetailReservasi;
