// src/pages/DetailReservasi.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/DetailReservasi.css";

const DetailReservasi = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState(state?.reservation || state?.selectedReservation || null);
  const [loading, setLoading] = useState(false);
  const [layananData, setLayananData] = useState([]);

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
    fetch("http://localhost:5000/layanan")
      .then((res) => res.json())
      .then((data) => {
        setLayananData(data);
      })
      .catch((error) => {
        console.error("Error fetching layanan data:", error);
      });
  }, []);

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

  const layananDetail = layananData.find(l => l.id === reservation.layanan_id);
  const harga = layananDetail ? layananDetail.harga : "Belum ditentukan";

  return (
    <div className="detail-container">
      <h2>Detail Pemesanan</h2>
      <div className="detail-box">
        <p><strong>Nama   :</strong> {reservation.nama}</p>
        <p><strong>Layanan:</strong> {layananDetail ? layananDetail.nama_layanan : "Tidak ditemukan"}</p>
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
