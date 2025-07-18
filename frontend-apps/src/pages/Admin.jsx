import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

const Admin = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    canceledReservations: 0,
    totalUsers: 0,
    popularServices: []
  });
  const navigate = useNavigate();
  const adminName = localStorage.getItem("userName") || "Admin";
  const currentDate = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== "admin") {
      alert("Anda tidak memiliki akses!");
      navigate("/login");
      return;
    }

    // Ambil data reservasi
    fetch("http://localhost:5000/reservasi", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        
        // Hitung statistik
        const pending = data.filter(r => r.status === "pending").length;
        const confirmed = data.filter(r => r.status === "confirmed").length;
        const canceled = data.filter(r => r.status === "canceled").length;
        
        // Hitung layanan terpopuler
        const services = {};
        data.forEach(r => {
          if (services[r.layanan]) {
            services[r.layanan]++;
          } else {
            services[r.layanan] = 1;
          }
        });

        const popularServices = Object.keys(services)
          .map(key => ({ name: key, count: services[key] }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        setStatsData(prev => ({
          ...prev,
          totalReservations: data.length,
          pendingReservations: pending,
          confirmedReservations: confirmed,
          canceledReservations: canceled,
          popularServices
        }));
      })
      .catch(err => console.error("Gagal mengambil data reservasi:", err));

    // Ambil data user
    fetch("http://localhost:5000/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setStatsData(prev => ({
          ...prev,
          totalUsers: data.length
        }));
      })
      .catch(err => console.error("Gagal mengambil data user:", err));
  }, [navigate]);

  const updateStatus = (id, status) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/reservasi/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Gagal update status");
        return res.json();
      })
      .then(() => {
        alert(`Reservasi telah di-${status}`);
        const updatedReservations = reservations.map(r => 
          r.id === id ? { ...r, status } : r
        );
        
        setReservations(updatedReservations);
        
        // Update statistik
        const pending = updatedReservations.filter(r => r.status === "pending").length;
        const confirmed = updatedReservations.filter(r => r.status === "confirmed").length;
        const canceled = updatedReservations.filter(r => r.status === "canceled").length;
        
        setStatsData(prev => ({
          ...prev,
          pendingReservations: pending,
          confirmedReservations: confirmed,
          canceledReservations: canceled
        }));
      })
      .catch(err => console.error("Error:", err));
  };

  const deleteUser = (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    fetch(`http://localhost:5000/auth/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Gagal menghapus user");
        return res.json();
      })
      .then(() => {
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        setStatsData(prev => ({
          ...prev,
          totalUsers: updatedUsers.length
        }));
        alert("User berhasil dihapus");
      })
      .catch(err => console.error("Gagal menghapus user:", err));
  };

  // Format tanggal reservasi dan jam secara terpisah
  const formatReservationDate = (dateString) => {
    if (!dateString) return "Tidak tersedia";
    try {
      const date = new Date(dateString);
      const dateOptions = { 
        day: "numeric", 
        month: "long", 
        year: "numeric"
      };
      return date.toLocaleDateString("id-ID", dateOptions);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Format tanggal tidak valid";
    }
  };

  const formatReservationTime = (jamString) => {
    if (!jamString) return "Tidak tersedia";
    try {
      const [hour, minute, second] = jamString.split(':').map(Number);
      const date = new Date();
      date.setHours(hour, minute, second || 0);
      const timeOptions = { 
        timeZone: 'Asia/Jakarta',
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      };
      return date.toLocaleTimeString("id-ID", timeOptions) + " WIB";
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Format waktu tidak valid";
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Menentukan waktu berdasarkan jam
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return "Selamat Pagi";
    } else if (hours >= 12 && hours < 15) {
      return "Selamat Siang";
    } else if (hours >= 15 && hours < 19) {
      return "Selamat Sore";
    } else {
      return "Selamat Malam";
    }
  };

  return (
    <div className={`dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="header-content">
            <h2>LPS Admin</h2>
            {/* Toggle Button - kondisional berdasarkan status sidebar */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
          <p className="admin-name">Hai, {adminName}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            <i className="fas fa-chart-line"></i> <span>Dashboard</span>
          </button>
          <button 
            className={activeTab === "reservasi" ? "active" : ""} 
            onClick={() => setActiveTab("reservasi")}
          >
            <i className="fas fa-calendar-check"></i> <span>Reservasi</span>
          </button>
          <button 
            className={activeTab === "users" ? "active" : ""} 
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users"></i> <span>Pengguna</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout} style={{ backgroundColor: "#f44336", color: "white", padding: "8px 15px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "10px", width: "100%", justifyContent: "center" }}>
            <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="dashboard-content">
        {/* Hamburger menu for mobile */}
        <div className="mobile-header">
          <button className="mobile-toggle" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <h2>Lia Perawatan Salon</h2>
        </div>
        
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1>{getGreeting()}, {adminName}!</h1>
              <p className="date-today">{currentDate}</p>
              <p className="welcome-message">Selamat datang di dashboard admin. Kelola reservasi dan pengguna dengan mudah dari sini.</p>
            </div>
            
            <div className="header-actions">
              <div className="profile-dropdown">
                <div className="profile-avatar" onClick={toggleProfileDropdown}>
                  <i className="fas fa-user-circle"></i>
                </div>
                {profileDropdownOpen && (
                  <div className="profile-menu">
                    <div className="profile-info">
                      <p className="profile-name">{adminName}</p>
                      <p className="profile-role">Administrator</p>
                    </div>
                    <div className="profile-menu-items">
                      <button className="profile-menu-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="tab-header">
            <h2>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "reservasi" && "Manajemen Reservasi"}
              {activeTab === "users" && "Manajemen Pengguna"}
            </h2>
          </div>
        </div>
        
        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="dashboard-overview">
            {/* Stat Cards */}
            <div className="stats-section">
              <h3 className="section-title">Statistik Ringkas</h3>
              <div className="stats-container">
                <div className="stat-card primary">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Total Reservasi</h3>
                    <p className="stat-number">{statsData.totalReservations}</p>
                  </div>
                </div>
                
                <div className="stat-card warning">
                  <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Menunggu Konfirmasi</h3>
                    <p className="stat-number">{statsData.pendingReservations}</p>
                  </div>
                </div>
                
                <div className="stat-card success">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Terkonfirmasi</h3>
                    <p className="stat-number">{statsData.confirmedReservations}</p>
                  </div>
                </div>
                
                <div className="stat-card danger">
                  <div className="stat-icon">
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Dibatalkan</h3>
                    <p className="stat-number">{statsData.canceledReservations}</p>
                  </div>
                </div>
                
                <div className="stat-card info">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Total Pengguna</h3>
                    <p className="stat-number">{statsData.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detail Sections */}
            <div className="dashboard-details">
              {/* Recent Reservations */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Reservasi Terbaru</h3>
                  <button className="view-all" onClick={() => setActiveTab("reservasi")}>
                    Lihat Semua <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Layanan</th>
                        <th>Tanggal Reservasi</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.slice(0, 5).map(res => (
                        <tr key={res.id}>
                          <td>{res.nama}</td>
                          <td>{res.layanan}</td>
                          <td>{formatReservationDate(res.tanggal_reservasi, res.created_at)}</td>
                          <td>
                            <span className={`status-badge ${res.status || "none"}`}>
                              {res.status === "pending" && "Menunggu"}
                              {res.status === "confirmed" && "Dikonfirmasi"}
                              {res.status === "canceled" && "Dibatalkan"}
                              {!res.status && "Belum Diproses"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Popular Services */}
              <div className="data-card">
                <div className="card-header">
                  <h3>Layanan Terpopuler</h3>
                </div>
                <div className="popular-services">
                  {statsData.popularServices.map((service, index) => (
                    <div className="service-item" key={index}>
                      <div className="service-info">
                        <span className="service-name">{service.name}</span>
                        <span className="service-count">{service.count} reservasi</span>
                      </div>
                      <div className="service-bar-container">
                        <div 
                          className="service-bar" 
                          style={{ 
                            width: `${(service.count / statsData.popularServices[0].count) * 100}%`,
                            backgroundColor: getBarColor(index)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabel Reservasi */}
        {activeTab === "reservasi" && (
          <div className="data-card">
            <div className="card-header">
              <h2>Daftar Reservasi</h2>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>No HP</th>
                    <th>Tanggal Reservasi</th>
                    <th>Waktu Reservasi</th>
                    <th>Layanan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length > 0 ? (
                    reservations.map(res => (
                  <tr key={res.id}>
                    <td>{res.nama}</td>
                    <td>{res.email}</td>
                    <td>{res.no_hp}</td>
                    <td>{formatReservationDate(res.tanggal_reservasi)}</td>
                    <td>{formatReservationTime(res.jam)}</td>
                    <td>{res.layanan}</td>
                    <td>
                      <span className={`status-badge ${res.status || "none"}`}>
                        {res.status === "pending" && "Menunggu"}
                        {res.status === "confirmed" && "Dikonfirmasi"}
                        {res.status === "canceled" && "Dibatalkan"}
                        {!res.status && "Belum Diproses"}
                      </span>
                    </td>
                    <td className="actions">
                      {res.status === "pending" ? (
                        <>
                          <button
                            className="action-btn confirm"
                            onClick={() => updateStatus(res.id, "confirmed")}
                            title="Konfirmasi"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => updateStatus(res.id, "canceled")}
                            title="Batalkan"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      ) : (
                        <span className="no-action">-</span>
                      )}
                    </td>
                  </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">Tidak ada data reservasi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Tabel User */}
        {activeTab === "users" && (
          <div className="data-card">
            <div className="card-header">
              <h2>Daftar Pengguna</h2>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nama}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="actions">
                          <button
                            className="action-btn delete"
                            onClick={() => deleteUser(user.id)}
                            title="Hapus"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">Tidak ada data pengguna</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Fungsi untuk mendapatkan warna bar chart sesuai dengan indeks
const getBarColor = (index) => {
  const colors = ['#5564eb', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
  return colors[index % colors.length];
};

export default Admin;
