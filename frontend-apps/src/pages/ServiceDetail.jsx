import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import haircolor from "../assets/OurService/HairColoring.jpg";
import smoothing from "../assets/OurService/Smooting.jpeg";
import facial from "../assets/OurService/Facial.jpg";
import creambath from "../assets/OurService/Creambath.jpg";
import hairmask from "../assets/OurService/HairMusk.jpg";
import hairspa from "../assets/OurService/HairSpa.jpg";
import bodyscrub from "../assets/OurService/BodyScrub.jpg";
import rebounding from "../assets/OurService/Rebounding.jpg";
import makeup from "../assets/OurService/MakeUp.jpg";
import "../styles/ServiceDetail.css";

const imageMap = {
  "Facial": facial,
  "Creambath": creambath,
  "Hair Mask": hairmask,
  "Hair Spa": hairspa,
  "Body Scrub": bodyscrub,
  "Rebonding": rebounding,
  "Smoothing": smoothing,
  "Make Up": makeup,
  "Hair Coloring": haircolor,
};

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/layanan/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Layanan tidak ditemukan');
        }
        return res.json();
      })
      .then((data) => {
        setService(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching layanan data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleReservation = () => {
    if (isLoggedIn && service) {
      // Simpan ID layanan untuk form reservasi
      localStorage.setItem("selectedServiceId", service.id);
      localStorage.setItem("selectedService", service.nama_layanan);
      navigate("/users");
    } else {
      navigate("/login");
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "number") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }
    return price;
  };

  if (loading) {
    return <div className="loading-container">Memuat detail layanan...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/services')}>Kembali ke daftar layanan</button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="error-container">
        <h2>Layanan Tidak Ditemukan</h2>
        <button onClick={() => navigate('/services')}>Kembali ke daftar layanan</button>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <h1>{service.nama_layanan}</h1>
      <img 
        src={service.gambar_url ? `http://localhost:5000${service.gambar_url}` : imageMap[service.nama_layanan] || ""} 
        alt={service.nama_layanan} 
        style={{ maxWidth: "600px" }} 
        onError={(e) => {
          // Jika gambar gagal dimuat, gunakan fallback dari imageMap
          if (service.gambar_url) {
            e.target.src = imageMap[service.nama_layanan] || "";
          }
        }}
      />
      <p>{service.deskripsi}</p>
      <p className="price-label">{formatPrice(service.harga)}</p>
      <button onClick={handleReservation}>Pesan Sekarang</button>
    </div>
  );
};

export default ServiceDetail;
