import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

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

  const price = reservation.harga || 0;
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
        <p>Layanan Dipilih : {reservation.nama_layanan || reservation.layanan}</p>
        <p>Tanggal Reservasi : {formattedDate}</p>
        <p>Jam Reservasi : {reservation.jam}</p>
        <p>No HP : {reservation.no_hp}</p>
        <p>Harga Layanan : Rp {price.toLocaleString("id-ID")}</p>
        <p>Status Pembayaran : {reservation.status || "Belum Dibayar"}</p>
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
        <button className="cancel-btn" onClick={() => navigate("/users")}>Batalkan</button>
        <button className="pay-btn" onClick={handlePay}>Konfirmasi</button>
      </div>
    </div>
  );
};

export default Payment;
