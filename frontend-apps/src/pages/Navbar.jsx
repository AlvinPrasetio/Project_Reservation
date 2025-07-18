import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut } from 'react-icons/fi';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Cek status login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserName = localStorage.getItem('userName');
    
    if (token) {
      setIsLoggedIn(true);
      setUserName(storedUserName || 'User');
    } else {
      setIsLoggedIn(false);
      setUserName('');
    }
  }, [location]); // Re-cek saat lokasi berubah (navigasi)

  // Handler untuk logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    navigate('/');
  };

  // Handler untuk toggle menu mobile
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Handler untuk toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Effect untuk menutup dropdown saat menu mobile ditutup
  
  useEffect(() => {
    if (!isNavOpen) {
      setIsDropdownOpen(false);
    }
  }, [isNavOpen]);
  

  // Effect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect untuk menutup menu saat ukuran layar berubah
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isNavOpen) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNavOpen]);

  // Cek active menu
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`} tabIndex="0">
      <div className="header__inner">
        <h1 tabIndex="0" className="header__title">Lia Perawatan Kulit</h1>
        
        <nav 
          id="nav__menu" 
          className={`nav__list ${isNavOpen ? 'nav-open' : ''}`} 
          tabIndex="0"
        >
          <ul className="nav__menu">
            <li className={`nav__item ${isActive('/')}`}>
              <Link to="/" onClick={() => setIsNavOpen(false)}>
                <span className="nav__link-text">Beranda</span>
              </Link>
            </li>
            <li className={`nav__item ${isActive('/services')}`}>
              <Link to="/services" onClick={() => setIsNavOpen(false)}>
                <span className="nav__link-text">Layanan Kami</span>
              </Link>
            </li>
            <li className={`nav__item ${isActive('/about')}`}>
              <Link to="/about" onClick={() => setIsNavOpen(false)}>
                <span className="nav__link-text">Tentang</span>
              </Link>
            </li>
            <li className={`nav__item ${isActive('/contact')}`}>
              <Link to="/contact" onClick={() => setIsNavOpen(false)}>
                <span className="nav__link-text">Kontak</span>
              </Link>
            </li>
            
            {isLoggedIn ? (
              <>
                <li className={`nav__item ${isActive('/users')}`}>
                  <Link to="/users" onClick={() => setIsNavOpen(false)}>
                    <span className="nav__link-text">Reservasi</span>
                  </Link>
                </li>
                {/* Nama pengguna untuk mobile */}
                <li className="nav__item mobile-profile-item">
                  <Link to="/users" onClick={() => setIsNavOpen(false)}>
                    <FiUser className="user-icon" /> {userName}
                  </Link>
                </li>
                {/* Menu logout untuk mobile */}
                <li className="nav__item mobile-logout-item">
                  <button className="mobile-logout-button" onClick={() => {
                    handleLogout();
                    setIsNavOpen(false);
                  }}>
                    <FiLogOut /> Logout
                  </button>
                </li>
                {/* User dropdown untuk desktop */}
                <li className="nav__item user-item desktop-only">
                  <div className="user-dropdown">
                    <span className="user-name" onClick={toggleDropdown}>
                      <FiUser className="user-icon" /> {userName}
                    </span>
                    <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                      <button className="edit-profile-button" onClick={() => {
                        setIsDropdownOpen(false);
                        setIsNavOpen(false);
                        navigate('/users/edit');
                      }}>
                        <FiUser /> Edit Profile
                      </button>
                      <button className="logout-button" onClick={() => {
                        handleLogout();
                        setIsNavOpen(false);
                        setIsDropdownOpen(false);
                      }}>
                        <FiLogOut /> Logout
                      </button>
                    </div>
                  </div>
                </li>
              </>
            ) : (
              <li className={`nav__item login-item`}>
                <Link to="/login" className="btn-login" onClick={() => setIsNavOpen(false)}>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <button 
          className={`nav-toggle ${isNavOpen ? 'active' : ''}`} 
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
