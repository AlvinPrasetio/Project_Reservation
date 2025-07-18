import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Payment.css";

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

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (location.state && location.state.reservation) {
      setReservation(location.state.reservation);
    } else {
      navigate("/users");
    }
  }, [location, navigate]);

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

  const price = servicePrices[reservation.layanan] || 0;

  return (
    <div className="payment-container">
      <h2>Pembayaran Reservasi</h2>

      <div className="payment-info">
        <p>Nama Pelanggan : {reservation.nama}</p>
        <p>Layanan Dipilih : {reservation.layanan}</p>
        <p>Tanggal Reservasi : {reservation.tanggal_reservasi}</p>
        <p>Jam Reservasi : {reservation.jam}</p>
        <p>No HP : {reservation.no_hp}</p>
        <p>Harga Layanan : Rp {price.toLocaleString("id-ID")}</p>
        <p>Status Pembayaran : Belum Dibayar</p>
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
