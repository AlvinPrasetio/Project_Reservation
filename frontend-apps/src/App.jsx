import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Users from "./pages/Users.jsx";
import UsersEdit from "./pages/UsersEdit.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import OurServices from './pages/OurServices.jsx';
import ServiceDetail from "./pages/ServiceDetail";
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Navbar from './pages/Navbar.jsx';
import Footer from "./pages/Footer.jsx";
import Payment from "./pages/Payment.jsx";
import DetailReservasi from "./pages/DetailReservation.jsx";
import './App.css';

// Komponen untuk mengatur lebar scrollbar CSS variable
function ScrollbarDetector() {
  useEffect(() => {
    // Fungsi untuk mendeteksi lebar scrollbar
    const detectScrollbarWidth = () => {
      // Buat div dengan overflow untuk mengukur scrollbar
      const outer = document.createElement('div');
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);
      
      // Buat div dalam untuk mengukur lebar konten tanpa scrollbar
      const inner = document.createElement('div');
      outer.appendChild(inner);
      
      // Hitung lebar scrollbar (outer width - inner width)
      const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
      
      // Hapus elemen temporary
      outer.parentNode.removeChild(outer);
      
      // Set CSS variable untuk digunakan di seluruh aplikasi
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    };

    // Deteksi saat halaman dimuat
    detectScrollbarWidth();

    // Deteksi saat ukuran window berubah
    window.addEventListener('resize', detectScrollbarWidth);
    return () => window.removeEventListener('resize', detectScrollbarWidth);
  }, []);

  return null;
}

// Komponen pembungkus untuk bisa pakai useLocation
function AppWrapper() {
  const location = useLocation();
  const hideNavbarOnPaths = ['/admin']; // daftar halaman yang TIDAK butuh navbar
  const hideFooterOnPaths = ['/users', '/admin', '/login', '/register'];
  
  const hideFooter = hideFooterOnPaths.includes(location.pathname);
  const hideNavbar = hideNavbarOnPaths.includes(location.pathname);

  return (
    <div className="app-container">
      {!hideNavbar && <Navbar />}
      <main className="app-main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/edit" element={<UsersEdit />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/services" element={<OurServices />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/detail-reservasi/:id" element={<DetailReservasi />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollbarDetector />
      <AppWrapper />
    </Router>
  );
}

export default App;
