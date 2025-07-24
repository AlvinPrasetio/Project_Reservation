import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [layananList, setLayananList] = useState([]);
  const [layananDetail, setLayananDetail] = useState(null);
  const [buktiTransfer, setBuktiTransfer] = useState(null);

  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const res = await fetch("http://localhost:5000/layanan");
        const data = await res.json();
        setLayananList(data);
      } catch (error) {
        console.error("Gagal mengambil data layanan:", error);
      }
    };
    fetchLayanan();
  }, []);

  useEffect(() => {
    if (reservation && layananList.length > 0) {
      const layanan = layananList.find((item) => item.id === reservation.layanan_id);
      setLayananDetail(layanan || null);
    }
  }, [reservation, layananList]);

  useEffect(() => {
    const fetchReservation = async (reservationId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Silakan login terlebih dahulu.");
          navigate("/login");
          return;
        }
        const response = await fetch(`http://localhost:5000/reservasi/${reservationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Gagal mengambil data reservasi");
        }
        const data = await response.json();
        setReservation(data);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data reservasi.");
        navigate("/users");
      }
    };

    if (location.state && location.state.reservation) {
      setReservation(location.state.reservation);
    } else if (id) {
      fetchReservation(id);
    } else {
      navigate("/users");
    }
  }, [location, navigate, id]);

  const handleCancel = async () => {
    const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan reservasi ini?");
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");
      const reservationId = reservation?.id || id;

      const response = await fetch(`http://localhost:5000/reservasi/${reservationId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membatalkan reservasi.");
      }

      alert("Reservasi berhasil dibatalkan.");
      navigate("/users");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membatalkan reservasi: " + error.message);
    }
  };

  const handleUpload = async () => {
    if (!buktiTransfer) {
      alert("Silakan upload bukti transfer terlebih dahulu.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const reservationId = reservation?.id || id;

      const formData = new FormData();
      formData.append("bukti_transfer", buktiTransfer);

      const response = await fetch(`http://localhost:5000/reservasi/${reservationId}/upload-bukti`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupload bukti transfer.");
      }

      alert("Bukti transfer berhasil dikirim. Mohon tunggu konfirmasi dari admin.");
      navigate("/users");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengupload bukti transfer: " + error.message);
    }
  };

  if (!reservation) {
    return null;
  }

  const formattedDate = new Date(reservation.tanggal_reservasi).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="payment-container">
      <h2>Pembayaran Reservasi</h2>

      <div className="payment-info">
        <p>Nama Pelanggan : {reservation.nama}</p>
        <p>Layanan Dipilih : {layananDetail ? layananDetail.nama_layanan : "Tidak ditemukan"}</p>
        <p>Tanggal Reservasi : {formattedDate}</p>
        <p>Jam Reservasi : {reservation.jam}</p>
        <p>No HP : {reservation.no_hp}</p>
        <p>Harga Layanan : Rp {layananDetail ? layananDetail.harga.toLocaleString("id-ID") : "Tidak tersedia"}</p>
        <p>Status Pembayaran : {reservation.status || "Belum Dibayar"}</p>
      </div>

      <h3>Pembayaran</h3>
      <div className="payment-methods">
        <p><strong>Transfer Bank</strong></p>
        <p className="rekening">No Rekening: 5420333121 (BCA a.n. Marlia)</p>
      </div>

      <div className="upload-button">
        <label htmlFor="bukti">Upload Bukti Transfer:</label>
        <input
          type="file"
          id="bukti"
          accept="image/*,application/pdf"
          onChange={(e) => setBuktiTransfer(e.target.files[0])}
        />
      </div>

      <div className="payment-buttons">
        <button className="cancel-btn" onClick={handleCancel}>Batalkan</button>
        <button className="pay-btn" onClick={handleUpload}>Kirim Bukti Transfer</button>
      </div>
    </div>
  );
};

export default Payment;
