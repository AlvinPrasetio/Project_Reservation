import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [layananList, setLayananList] = useState([]);
  const [layananDetail, setLayananDetail] = useState(null);

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

  const handlePay = () => {
    if (!paymentMethod) {
      alert("Silakan pilih metode pembayaran terlebih dahulu.");
      return;
    }

    // Simulasi pembayaran
    alert(`Pembayaran melalui ${paymentMethod}, Mohon Tunggu Konfirmasi oleh Admin!`);
    navigate("/users");
  };

  if (!reservation) {
    return null;
  }

  const handleCancel = async () => {
  const confirmCancel = window.confirm("Apakah Anda yakin ingin membatalkan reservasi ini?");
  if (!confirmCancel) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/reservasi/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Gagal membatalkan reservasi.");
    }

        alert("Reservasi berhasil dibatalkan.");
        navigate("/users");
      } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan saat membatalkan reservasi.");
      }
    };


  // const price = reservation.harga || 0;
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
        <p>Layanan Dipilih : {layananDetail ? layananDetail.nama_layanan : "Tidak ditemukan"}</p>        <p>Tanggal Reservasi : {formattedDate}</p>
        <p>Jam Reservasi : {reservation.jam}</p>
        <p>No HP : {reservation.no_hp}</p>
        <p>Harga Layanan : Rp {layananDetail ? layananDetail.harga.toLocaleString("id-ID") : "Tidak tersedia"}</p>        <p>Status Pembayaran : {reservation.status || "Belum Dibayar"}</p>
      </div>

      <h3>Metode Pembayaran</h3>
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="Transfer Bank"
            checked={paymentMethod === "Transfer Bank"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Transfer Bank<br />
          <span className="rekening">No Rekening: 5420333121 (BCA a.n. Marlia)</span>
        </label>
        <label>
          <input
            type="radio"
            value="Bayar Ditempat"
            checked={paymentMethod === "Bayar Ditempat"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Bayar Ditempat
        </label>
      </div>

      <a
        href="https://wa.me/6285155140228?text=Halo%20saya%20ingin%20konfirmasi%20pembayaran%20reservasi%20di%20Lia%20Perawatan%20Kulit."
        target="_blank"
        rel="noopener noreferrer"
        className="wa-button"
      >
        Konfirmasi WhatsApp
      </a>

      <div className="payment-buttons">
        <button className="cancel-btn" onClick={handleCancel}>Batalkan</button>
        <button className="pay-btn" onClick={handlePay}>Konfirmasi</button>
      </div>
    </div>
  );
};

export default Payment;
