import '../styles/About.css';
import skinCareImage from '../assets/gambar_luar.jpg';

const About = () => {
  return (
    <div className="page-container">
      <div className="about-container">
        <div className="about-text">
          <h1>Tentang Lia Perawatan Kulit </h1>
          <div className="about-section">
            <div className="icon">�</div>
            <div>
              <h3>Reservasi Mudah</h3>
              <p>Kini Anda bisa melakukan reservasi perawatan kulit secara online di LIA Perawatan Kulit tanpa perlu antre lama. Pilih tanggal, jam, dan jenis layanan yang diinginkan, lalu datang sesuai jadwal. Praktis, cepat, dan nyaman!</p>
            </div>
          </div>
          <div className="about-section">
            <div className="icon">💰</div>
            <div>
              <h3>Harga Terjangkau</h3>
              <p>Kami menawarkan harga yang kompetitif untuk semua layanan perawatan kulit tanpa mengorbankan kualitas dan kenyamanan.</p>
            </div>
          </div>
          <div className="about-section">
            <div className="icon">�‍♀️</div>
            <div>
              <h3>Perawatan Personal</h3>
              <p>Tim profesional kami memberikan perawatan yang disesuaikan dengan kebutuhan kulit Anda, memastikan hasil yang optimal dan memuaskan.</p>
            </div>
          </div>
          <div className="about-section">
            <div className="icon">⚡</div>
            <div>
              <h3>Janji Temu Cepat</h3>
              <p>Pesan janji temu Anda dengan cepat dan mudah melalui sistem online kami, tanpa proses yang rumit.</p>
            </div>
          </div>
        </div>
        <div className="about-image" style={{ alignSelf: 'center' }}>
          <img src={skinCareImage} alt="LIA Perawatan Kulit" />
        </div>
      </div>
    </div>
  );
};

export default About;
