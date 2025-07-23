import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/OurServices.css";
import haircolor from "../assets/OurService/HairColoring.jpg";
import smoothing from "../assets/OurService/Smooting.jpeg";
import facial from "../assets/OurService/Facial.jpg";
import creambath from "../assets/OurService/Creambath.jpg";
import hairmask from "../assets/OurService/HairMusk.jpg";
import hairspa from "../assets/OurService/HairSpa.jpg";
import bodyscrub from "../assets/OurService/BodyScrub.jpg";
import rebounding from "../assets/OurService/Rebounding.jpg";
import makeup from "../assets/OurService/MakeUp.jpg";

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

const OurServices = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/layanan")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
      })
      .catch((error) => {
        console.error("Error fetching layanan data:", error);
      });
  }, []);

  return (
    <div className="page-container">
      <div className="services-container">
        <h1 className="title">Layanan Kami</h1>
        <div className="services-grid">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.id}`}
              className="service-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src={service.gambar_url ? `http://localhost:5000${service.gambar_url}` : imageMap[service.nama_layanan] || ""}
                alt={service.nama_layanan}
                className="service-img"
                onError={(e) => {
                  // Jika gambar gagal dimuat, gunakan fallback dari imageMap
                  if (service.gambar_url) {
                    e.target.src = imageMap[service.nama_layanan] || "";
                  }
                }}
              />
              <div className="service-info">
                <h4 className="service-title">{service.nama_layanan}</h4>
                <p className="price-label">{formatPrice(service.harga)}</p>
                <p className="service-desc">{service.deskripsi}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurServices;
