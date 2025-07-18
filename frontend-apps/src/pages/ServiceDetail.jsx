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

const services = [
  {
      title: "Facial",
      price: "Rp125.000",
      desc: "Perawatan wajah lengkap dengan pembersihan, eksfoliasi, masker (gold atau biasa), serta pijat relaksasi.",
      img: facial
    },
    {
      title: "Creambath",
      price: "Rp85.000",
      desc: "Perawatan rambut dengan krim khusus, melembutkan & memulihkan rambut. Harga tergantung panjang atau pendek rambut.",
      img: creambath
    },
    {
      title: "Hair Mask",
      price: "Rp100.000",
      desc: "Masker rambut nutrisi mendalam untuk menguatkan & melembapkan. Harga menyesuaikan panjang rambut.",
      img: hairmask
    },
    {
      title: "Hair Spa",
      price: "Rp100.000",
      desc: "Perawatan intensif rambut & kulit kepala: pijat, serum, dan masker khusus untuk kelembapan maksimal. Harga tergantung panjang rambut.",
      img: hairspa
    },
    {
      title: "Body Scrub",
      price: "Rp100.000",
      desc: "Eksfoliasi tubuh dengan scrub alami untuk mengangkat sel kulit mati & menjadikan kulit lebih halus dan cerah.",
      img: bodyscrub
    },
    {
      title: "Rebonding",
      price: "Rp350.000",
      desc: "Perawatan pelurusan rambut semi-permanen dengan hasil halus, rapi, & tahan lama. Harga menyesuaikan panjang rambut.",
      img: rebounding
    },
    {
      title: "Smoothing",
      price: "Rp320.000",
      desc: "Perawatan pelurusan rambut untuk hasil lebih natural & lembut. Harga tergantung panjang rambut.",
      img: smoothing
    },
    {
      title: "Make Up",
      price: "Rp150.000",
      desc: "Layanan make-up profesional untuk berbagai acara. Bisa di tempat atau dipanggil ke lokasi, harga per kepala.",
      img: makeup
    },
    {
      title: "Hair Coloring",
      price: "Rp200.000",
      desc: "Pewarnaan rambut profesional dengan pilihan warna, harga tergantung panjang atau pendek rambut.",
      img: haircolor
    }
];

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services[id];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Cek status login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleReservation = () => {
    if (isLoggedIn) {
      // Simpan nama layanan ke localStorage
      localStorage.setItem("selectedService", service.title);
      
      // Redirect ke halaman Users/reservasi
      navigate("/users");
    } else {
      // Redirect ke halaman login
      navigate("/login");
    }
  };

  return (
    <div className="service-detail">
      <h1>{service.title}</h1>
      <img src={service.img} alt={service.title} style={{ maxWidth: "600px" }} />
      <p>{service.desc}</p>
      <p>{service.price}</p>
      <button onClick={handleReservation}>Pesan Sekarang</button>
    </div>
  );
};

export default ServiceDetail;
