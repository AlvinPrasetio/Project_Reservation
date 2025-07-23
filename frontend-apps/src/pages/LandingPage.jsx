import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/LandingPage.css";
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

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [layananData, setLayananData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const response = await fetch("/layanan");
        if (!response.ok) throw new Error("Failed to fetch layanan data");
        const data = await response.json();
        setLayananData(data);
      } catch (error) {
        console.error("Error fetching layanan data:", error);
      }
    };
    fetchLayanan();
  }, []);

  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR"
      });
    }
    return price;
  };

  const testimonials = [
    { nama: "Ayu", pesan: "Kulit saya lebih glowing setelah perawatan di sini!" },
    { nama: "Sinta", pesan: "Pelayanannya ramah dan hasilnya memuaskan." },
    { nama: "Aprilla Utami", pesan: "Awal ke klinik karena wajah kusam, sekarang lebih cerah dan glowing natural setelah rutin creambath & facial." },
    { nama: "Fitri Sulistiyawati", pesan: "Jerawat parah hilang setelah rutin perawatan mesotherapy & honey bee venom selama 2 bulan." },
    { nama: "Tia Sthefani A", pesan: "Bekas jerawat cepat hilang, dan kulit jadi bersih hanya dalam 3 hari perawatan green tea extract." },
    { nama: "Desy", pesan: "Saya jatuh cinta sama scrubbing dan serum, jerawat berkurang dalam 2 bulan rutin facial." },
    { nama: "Widia Sri Ardias", pesan: "Setelah 5 bulan, kulit saya cerah alami, bebas bruntusan dan pori mengecil." },
    { nama: "Linda Permata", pesan: "Rambut saya jadi lembut dan tidak rontok setelah hair spa di sini." },
    { nama: "Theodora Anindita", pesan: "Komedo di hidung hilang, dan produk tea-tree sangat cocok untuk kulit berminyak saya." }
  ];

  const faqs = [
    {
      question: "Kenapa saya harus melakukan reservasi perawatan secara online?",
      answer: "Reservasi online memudahkan Anda memilih jadwal perawatan sesuai waktu luang, serta menghindari antrean di klinik."
    },
    {
      question: "Bagaimana cara melakukan reservasi perawatan?",
      answer: "Cukup pilih layanan yang Anda inginkan di halaman website, tentukan jadwal kunjungan, lalu konfirmasi dengan mengisi data diri dan pembayaran jika diperlukan."
    },
    {
      question: "Apakah saya bisa datang langsung tanpa reservasi?",
      answer: "Kami sarankan melakukan reservasi online agar Anda mendapat slot perawatan sesuai jadwal, karena pelanggan tanpa reservasi akan dilayani berdasarkan ketersediaan waktu terdekat."
    },
    {
      question: "Bisakah saya membatalkan atau mengubah jadwal reservasi?",
      answer: "Ya, Anda dapat membatalkan atau menjadwalkan ulang reservasi melalui akun Anda di website minimal 24 jam sebelum jadwal perawatan."
    },
    {
      question: "Apakah saya harus membayar saat reservasi?",
      answer: "Sebagian layanan memerlukan pembayaran uang muka (DP) untuk mengamankan slot perawatan. Sisa pembayaran dilakukan di klinik setelah perawatan selesai."
    },
    {
      question: "Bagaimana saya tahu reservasi saya berhasil?",
      answer: "Setelah reservasi berhasil, Anda akan menerima email konfirmasi berisi detail layanan, jadwal, dan informasi kontak klinik Lia Perawatan Kulit."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="landing-page">
      <main id="mainContent">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>Layanan Kecantikan Profesional</h1>
            <p>Untuk kulit sehat, cerah, dan terawat</p>
            <Link to={isLoggedIn ? "/users" : "/login"}>
              <button className="btn-primary">Reservasi Sekarang</button>
            </Link>
          </div>
        </section>

        {/* Our Services Section */}
        <section className="services-section">
          <h2 className="section-title">Layanan Kami</h2>
          <div className="service-cards">
            {layananData.slice(0, 6).map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-image">
                  <img
                    src={imageMap[service.nama_layanan] || haircolor}
                    alt={service.nama_layanan}
                  />
                </div>
                <div className="service-info">
                  <h3 className="service-title">{service.nama_layanan}</h3>
                  <p className="price-label">{formatPrice(service.harga)}</p>
                  <p className="service-desc">{service.deskripsi}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-services">
            <Link to="/services">
              <button className="btn-secondary">Lihat Semua Layanan</button>
            </Link>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2 className="section-title">Testimoni Pelanggan</h2>
          <div className="testimonial-cards">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <p className="testimonial-text">{`"${testimonial.pesan}"`}</p>
                <h4 className="testimonial-author">— {testimonial.nama}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="section-title">Pertanyaan Seputar Reservasi</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div
                  className="faq-question"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{openIndex === index ? "−" : "+"}</span>
                </div>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
