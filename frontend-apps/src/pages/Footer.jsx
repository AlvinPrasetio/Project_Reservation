// import React from 'react';
import { FaInstagram, FaGithub, FaDiscord } from 'react-icons/fa';
import { MdEmail, MdLocalPhone, MdLocationOn } from 'react-icons/md';
import '../styles/Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-section">
        <h3>Lia Perawatan Kulit</h3>
        <p>
          Lia Perawatan Kulit berkomitmen memberikan layanan kecantikan terbaik seperti facial, spa,
          creambath, dan hair styling. Dengan tenaga ahli profesional dan bahan berkualitas, kami
          menghadirkan pengalaman perawatan yang menyenangkan dan menyegarkan.
        </p>
      </div>
      <div className="footer-section">
        <h3>Kontak Kami</h3>
        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon">
              <MdEmail />
            </div>
            <div className="contact-card-info">
              <h4>Email</h4>
              <p>liaperawatankulit@gmail.com</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="contact-card-icon">
              <MdLocalPhone />
            </div>
            <div className="contact-card-info">
              <h4>Telepon</h4>
              <p>+62 812-8884-6981</p>
            </div>
          </div>
          
          <div className="contact-card">
            <div className="contact-card-icon">
              <MdLocationOn />
            </div>
            <div className="contact-card-info">
              <h4>Alamat</h4>
              <p>BTN Pepabri Blok I NO. 32 Bojong Leles, Cibadak, Lebak</p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-section">
        <h3>Ikuti Kami</h3>
        <div className="social-icons">
          <a href="https://www.instagram.com/lia_perawatankulit?igsh=Zmh3eXhkd3Fld21q" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://github.com/AlvinPrasetio" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub />
          </a>
          <a href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
            <FaDiscord />
          </a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      &copy; {new Date().getFullYear()} Lia Perawatan Kulit | Designed By Alvin Prasetio
    </div>
  </footer>
);

export default Footer;
