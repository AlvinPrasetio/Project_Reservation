import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { FiRefreshCw, FiCheckCircle, FiClock, FiXCircle, FiUser, FiLogOut, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "../styles/Users.css";

const Users = () => {
  const [reservations, setReservations] = useState([]);
  const [layanan, setLayanan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [noHp, setNoHp] = useState("");
  const [jam, setJam] = useState("");
  const [reservedJam, setReservedJam] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dateInputRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "";

  // Menggunakan useMemo untuk mencegah rerender berlebih
  const layananOptions = useMemo(() => [
  "Facial",
  "Creambath",
  "Hair Mask",
  "Hair Spa",
  "Body Scrub",
  "Rebonding",
  "Smoothing",
  "Make Up",
  "Hair Coloring",
  ], []);


  const jamOptions = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00"
];


  // Effect untuk mengisi layanan dari localStorage jika ada
  useEffect(() => {
    const selectedService = localStorage.getItem("selectedService");
    if (selectedService && layananOptions.includes(selectedService)) {
      setLayanan(selectedService);
      // Hapus dari localStorage setelah digunakan
      localStorage.removeItem("selectedService");
      
      // Scroll ke formulir reservasi
      setTimeout(() => {
        const reservationForm = document.querySelector(".reservation-form");
        if (reservationForm) {
          reservationForm.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [layananOptions]);

  const fetchReservations = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    
    fetch("http://localhost:5000/reservasi", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setReservations(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data:", err);
        setIsLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Effect untuk mengambil jam yang sudah dipesan saat tanggal berubah
  useEffect(() => {
    if (!tanggal) {
      setReservedJam([]);
      return;
    }

    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/reservasi/reserved-jam?date=${tanggal}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setReservedJam(data.reservedJam || []);
      })
      .catch((err) => {
        console.error("Gagal mengambil jam yang sudah dipesan:", err);
        setReservedJam([]);
      });
  }, [tanggal]);

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

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reservations.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleReservasi = async (e) => {
    e.preventDefault();

    if (!layanan || !tanggal || !noHp || !jam) {
      alert("Silakan lengkapi semua data!");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("token");
    const reservasiData = {
      nama: userName,
      email: userEmail,
      no_hp: noHp,
      tanggal_reservasi: tanggal,
      layanan: layanan,
      jam: jam,
      status: "pending",
    };

    try {
      console.log("Mengirim data reservasi:", reservasiData);
      const response = await fetch("http://localhost:5000/reservasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reservasiData),
      });

      const result = await response.json();
      console.log("Response dari server:", result);
      
      if (response.ok) {
        alert("Reservasi berhasil dibuat!");
        // Pastikan data baru ditambahkan ke state
        const newReservation = result.data || {
          ...reservasiData,
          id: result.id,
          tanggal_reservasi: new Date(tanggal).toISOString()
        };
        
        setReservations([...reservations, newReservation]); 
        setLayanan("");
        setTanggal("");
        setNoHp("");
        setJam("");
        
        // Reload data reservasi untuk memastikan data terbaru
        fetchReservations();

        // Keep loading state for a short delay before navigation
        setIsLoading(false);
        console.log("Navigasi ke halaman pembayaran");
        navigate("/payment", { state: { reservation: newReservation } });
      } else {
        alert("Gagal membuat reservasi: " + (result.message || "Terjadi kesalahan"));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error saat membuat reservasi:", error);
      alert("Terjadi kesalahan saat membuat reservasi");
      setIsLoading(false);
    }
  };

  // const handleDetailClick = (item) => {
  // navigate("/detail-reservasi", { state: { selectedReservation: item } });
  // };


  // Handler untuk logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Handler untuk toggle menu mobile
  const toggleNav = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handler untuk toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Effect untuk menutup dropdown saat menu mobile ditutup
  useEffect(() => {
    if (!mobileMenuOpen) {
      setIsDropdownOpen(false);
    }
  }, [mobileMenuOpen]);

  // Function untuk menampilkan status dengan icon
  const renderStatus = (status) => {
    switch(status) {
      case "confirmed":
        return (
          <div className="status-confirmed">
            <FiCheckCircle /> Dikonfirmasi
          </div>
        );
      case "pending":
        return (
          <div className="status-pending">
            <FiClock /> Menunggu
          </div>
        );
      case "canceled":
        return (
          <div className="status-canceled">
            <FiXCircle /> Dibatalkan
          </div>
        );
      default:
        return status;
    }
  };

  // Cek active menu
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Mengambil tanggal hari ini dalam format yyyy-mm-dd untuk nilai minimal tanggal
  const today = new Date().toISOString().split('T')[0];

  // Format tanggal untuk ditampilkan dengan format yang lebih user-friendly
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Fungsi untuk membuka dialog kalender secara manual
  const openDatePicker = () => {
    if (dateInputRef.current) {
      // Metode 1: Menggunakan click event
      dateInputRef.current.showPicker();
      
      // Metode 2: Fallback untuk browser yang tidak mendukung showPicker
      if (typeof dateInputRef.current.showPicker !== 'function') {
        const event = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        dateInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <>
      {/* Navbar/Header yang mirip dengan Navbar.jsx */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`} tabIndex="0">
        <div className="header__inner">
          <h1 tabIndex="0" className="header__title">Lia Perawatan Kulit</h1>
          
          <nav 
            id="nav__menu" 
            className={`nav__list ${mobileMenuOpen ? 'nav-open' : ''}`} 
            tabIndex="0"
          >
            <ul className="nav__menu">
              <li className={`nav__item ${isActive('/')}`}>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav__link-text">Beranda</span>
                </Link>
              </li>
              <li className={`nav__item ${isActive('/services')}`}>
                <Link to="/services" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav__link-text">Layanan Kami</span>
                </Link>
              </li>
              <li className={`nav__item ${isActive('/about')}`}>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav__link-text">Tentang</span>
                </Link>
              </li>
              <li className={`nav__item ${isActive('/contact')}`}>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav__link-text">Kontak</span>
                </Link>
              </li>
              <li className={`nav__item ${isActive('/users')}`}>
                <Link to="/users" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav__link-text">Reservasi</span>
                </Link>
              </li>
              {/* Nama pengguna untuk mobile */}
              <li className="nav__item mobile-profile-item">
                <Link to="/users" onClick={() => setMobileMenuOpen(false)}>
                  <FiUser className="user-icon" /> {userName}
                </Link>
              </li>
              {/* Menu logout untuk mobile */}
              <li className="nav__item mobile-logout-item">
                <button className="mobile-logout-button" onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
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
                      setMobileMenuOpen(false);
                      navigate('/users/edit');
                    }}>
                      <FiUser /> Edit Profile
                    </button>
                    <button className="logout-button" onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                      setIsDropdownOpen(false);
                    }}>
                      <FiLogOut /> Logout
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
          
          <button 
            className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`} 
            onClick={toggleNav}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <div className="page-container">
        <div className="user-wrapper">
          <h1>Selamat Datang, {userName}!</h1>
          <p>Lakukan reservasi layanan atau lihat riwayat pesanan Anda.</p>

          <div className="user-content">
            {/* Form Reservasi */}
            <div className="reservation-form">
              <h2>Reservasi Layanan</h2>
              <form onSubmit={handleReservasi}>
                <label htmlFor="layanan">Pilih Layanan:</label>
                <select
                  id="layanan"
                  value={layanan}
                  onChange={(e) => setLayanan(e.target.value)}
                >
                  <option value="">-- Pilih Layanan --</option>
                  {layananOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>

                <label htmlFor="tanggal">Tanggal Reservasi:</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="tanggal"
                    ref={dateInputRef}
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    onClick={openDatePicker}
                    min={today}
                    className={tanggal ? "date-selected" : ""}
                    required
                  />
                </div>
                {!tanggal && (
                  <p className="date-instruction">
                    Klik untuk memilih tanggal reservasi
                  </p>
                )}
                {tanggal && (
                  <p className="selected-date-display">
                    Tanggal dipilih: {formatDate(tanggal)}
                  </p>
                )}

                <label htmlFor="jam">Jam Reservasi:</label>
                <select
                  id="jam"
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Jam --</option>
                {jamOptions.map((slot, idx) => {
                    // Cek waktu sekarang, kalau slot jam sudah lewat, disable
                    const today = new Date().toISOString().split('T')[0];
                    const selectedDate = tanggal || today;

                    const slotTime = new Date(`${selectedDate}T${slot}:00`);
                    const now = new Date();

                    const isPast = selectedDate === today && slotTime < now;
                    const isReserved = reservedJam.includes(slot + ":00");

                    return (
                      <option key={idx} value={slot} disabled={isPast || isReserved}>
                        {slot} {isPast ? "(Waktu sudah lewat)" : isReserved ? "(Sudah dipesan)" : ""}
                      </option>
                    );
                  })}
                </select>
 
                <label htmlFor="nohp">No HP:</label>
                <input
                  type="text"
                  id="nohp"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Nomor HP aktif"
                />

                <button type="submit" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Konfirmasi Pesanan"}
                </button>
              </form>
            </div>

            {/* Tabel Riwayat Reservasi */}
            <div className="reservation-history">
              <div className="history-header">
                <h2>Riwayat Reservasi</h2>
                <div className="history-actions">
                  <button className="refresh-btn" onClick={fetchReservations} disabled={isLoading}>
                    <FiRefreshCw /> {isLoading ? "Memuat..." : "Refresh"}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="loading">Memuat data...</div>
              ) : (
                <>
                  {reservations && reservations.length > 0 ? (
                    <>
                      <table className="reservation-table">
                        <thead>
                          <tr>
                            <th>Layanan</th>
                            <th>Tanggal</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.map((res) => (
                            <tr 
                              key={res.id} 
                              className="clickable-row"
                              onClick={() => {
                                console.log("Clicked reservation ID:", res.id);
                                navigate(`/detail-reservasi/${res.id}`, { state: { reservation: res } });
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{res.layanan}</td>
                              <td>{new Date(res.tanggal_reservasi).toLocaleDateString('id-ID', {
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                              })}</td>
                              <td>
                                {renderStatus(res.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {/* Pagination Control */}
                      {totalPages > 1 && (
                        <div className="pagination">
                          <button 
                            className="pagination-btn prev" 
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <FiChevronLeft />
                          </button>
                          
                          <div className="pagination-info">
                            Halaman {currentPage} dari {totalPages}
                          </div>
                          
                          <button 
                            className="pagination-btn next" 
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            <FiChevronRight />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-reservations">
                      <p>Belum ada reservasi</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
