import '../styles/Contact.css';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="page-container">
      <div className="contact-container">
        <h1>Hubungi Kami</h1>
        
        <div className="contact-info">
          <div className="contact-item">
            <div className="contact-icon">
              <FiMail />
            </div>
            <div className="contact-text">
              <h3>Email</h3>
              <p>liaperwatankulit@gmail.com</p>
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">
              <FiPhone />
            </div>
            <div className="contact-text">
              <h3>Telepon</h3>
              <p>+62 812-8884-6981</p>
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">
              <FiMapPin />
            </div>
            <div className="contact-text">
              <h3>Alamat</h3>
              <p>BTN Pepabri Blok I NO. 32 Bojong Leles, Cibadak, Kabupaten Lebak</p>
            </div>
          </div>
        </div>
        
        <div className="contact-map">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.110097321785!2d106.12126551537247!3d-6.751990167934337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e4283647d745e2b%3A0xb56e8daf1c7067a3!2sBTN%20PEPABRI%20Blok%20I%2C%20Bojong%20Leles%2C%20Kec.%20Cibadak%2C%20Kabupaten%20Lebak%2C%20Banten!5e0!3m2!1sid!2sid!4v1653813991059!5m2!1sid!2sid" 
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokasi Salon"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
