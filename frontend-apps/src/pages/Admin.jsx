import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";
// Import image map dari OurServices
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

const Admin = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [layanan, setLayanan] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState("");
  // State untuk modal layanan
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentLayanan, setCurrentLayanan] = useState({
    id: null,
    nama_layanan: "",
    deskripsi: "",
    harga: "",
    durasi: "",
    gambar_url: "" // Tambahkan gambar_url
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // New state for proof of transfer modal
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState(null);

  const [statsData, setStatsData] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    canceledReservations: 0,
    totalUsers: 0,
    totalLayanan: 0,
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
    
    setToken(token);

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
          if (services[r.nama_layanan]) {
            services[r.nama_layanan]++;
          } else {
            services[r.nama_layanan] = 1;
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
      
    // Ambil data layanan
    fetch("http://localhost:5000/layanan", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setLayanan(data);
        setStatsData(prev => ({
          ...prev,
          totalLayanan: data.length
        }));
      })
      .catch(err => console.error("Gagal mengambil data layanan:", err));
  }, [navigate]);
  
  // Fungsi untuk mengelola layanan
  const fetchLayanan = async () => {
    try {
      const response = await fetch("http://localhost:5000/layanan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data layanan");
      }
      
      const data = await response.json();
      setLayanan(data);
      setStatsData(prev => ({
        ...prev,
        totalLayanan: data.length
      }));
    } catch (error) {
      console.error("Error fetching layanan:", error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Jika field harga, pastikan hanya angka yang diinput
    if (name === "harga") {
      const numericValue = value.replace(/\D/g, "");
      setCurrentLayanan({ ...currentLayanan, [name]: numericValue });
    } else {
      setCurrentLayanan({ ...currentLayanan, [name]: value });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const openAddModal = () => {
    setCurrentLayanan({
      id: null,
      nama_layanan: "",
      deskripsi: "",
      harga: "",
      durasi: "",
      gambar_url: ""
    });
    setImagePreview(null);
    setImageFile(null);
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (layanan) => {
    setCurrentLayanan(layanan);
    
    // Jika layanan memiliki gambar_url dari database, gunakan itu
    if (layanan.gambar_url) {
      setImagePreview(`http://localhost:5000${layanan.gambar_url}`);
    } else {
      // Fallback ke gambar dari imageMap
      setImagePreview(imageMap[layanan.nama_layanan] || "");
    }
    
    setImageFile(null);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (layanan) => {
    setCurrentLayanan(layanan);
    setIsDeleteModalOpen(true);
  };
  
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };
  
  const handleAddLayanan = async (e) => {
    e.preventDefault();
    
    try {
      // Create form data to handle file upload
      const formData = new FormData();
      formData.append('nama_layanan', currentLayanan.nama_layanan);
      formData.append('deskripsi', currentLayanan.deskripsi);
      formData.append('harga', parseFloat(currentLayanan.harga));
      formData.append('durasi', currentLayanan.durasi);
      
      if (imageFile) {
        formData.append('gambar', imageFile);
      }
      
      const response = await fetch("http://localhost:5000/layanan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Don't include Content-Type when sending FormData
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan layanan");
      }
      
      // Refresh layanan dan tutup modal
      fetchLayanan();
      closeModals();
      
      alert("Layanan berhasil ditambahkan!");
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleEditLayanan = async (e) => {
    e.preventDefault();
    
    try {
      // Create form data to handle file upload
      const formData = new FormData();
      formData.append('nama_layanan', currentLayanan.nama_layanan);
      formData.append('deskripsi', currentLayanan.deskripsi);
      formData.append('harga', parseFloat(currentLayanan.harga));
      formData.append('durasi', currentLayanan.durasi);
      
      if (imageFile) {
        formData.append('gambar', imageFile);
      }
      
      const response = await fetch(`http://localhost:5000/layanan/${currentLayanan.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Don't include Content-Type when sending FormData
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupdate layanan");
      }
      
      // Refresh layanan dan tutup modal
      fetchLayanan();
      closeModals();
      
      alert("Layanan berhasil diperbarui!");
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleDeleteLayanan = async () => {
    try {
      const response = await fetch(`http://localhost:5000/layanan/${currentLayanan.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus layanan");
      }
      
      // Refresh layanan dan tutup modal
      fetchLayanan();
      closeModals();
      
      alert("Layanan berhasil dihapus!");
    } catch (error) {
      alert(error.message);
    }
  };

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
          <button
            className={activeTab === "layanan" ? "active" : ""} 
            onClick={() => setActiveTab("layanan")}
          >
            <i className="fas fa-spa"></i> <span>Layanan</span>
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
          </div>
          
          <div className="tab-header">
            <h2>
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "reservasi" && "Manajemen Reservasi"}
              {activeTab === "users" && "Manajemen Pengguna"}
              {activeTab === "layanan" && "Daftar Layanan"}
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
                
                <div className="stat-card secondary">
                  <div className="stat-icon">
                    <i className="fas fa-spa"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Total Layanan</h3>
                    <p className="stat-number">{statsData.totalLayanan}</p>
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
                      <td>{res.nama_layanan}</td>
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
            <th>No HP</th>
            <th>Tanggal Reservasi</th>
            <th>Waktu Reservasi</th>
            <th>Layanan</th>
            <th>Bukti Transfer</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length > 0 ? (
            reservations.map(res => (
          <tr key={res.id}>
            <td>{res.nama}</td>
            <td>{res.no_hp}</td>
            <td>{formatReservationDate(res.tanggal_reservasi)}</td>
            <td>{formatReservationTime(res.jam)}</td>
            <td>{res.nama_layanan}</td>
            <td>
              {res.bukti_transfer ? (
                <button
                  className="btn-view-proof"
                  onClick={() => {
                    setSelectedProofImage(`http://localhost:5000/uploads/bukti_tf/${res.bukti_transfer}`);
                    setIsProofModalOpen(true);
                  }}
                >
                  Lihat
                </button>
              ) : (
                <span>Tidak ada</span>
              )}
            </td>
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
              <td colSpan="8" className="no-data">Tidak ada data reservasi</td>
            </tr>
          )}
        </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Bukti Transfer */}
        {isProofModalOpen && (
          <div 
            className="modal" 
            onClick={(e) => {
              if (e.target.className === "modal") {
                setIsProofModalOpen(false);
                setSelectedProofImage(null);
              }
            }}
          >
            <div className="modal-content proof-modal-content">
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setIsProofModalOpen(false);
                  setSelectedProofImage(null);
                }}
                aria-label="Close modal"
              >
                &times;
              </button>
              <img 
                src={selectedProofImage} 
                alt="Bukti Transfer" 
                className="proof-image"
              />
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
        
        {/* Tab Layanan */}
        {activeTab === "layanan" && (
          <div className="layanan-admin-container">
            <div className="layanan-header">
              <h3>Daftar Layanan Salon</h3>
              <button className="btn-add" onClick={openAddModal}>
                <i className="fas fa-plus"></i> Tambah Layanan Baru
              </button>
            </div>
            
            <div className="services-admin-grid">
              {layanan.map((service) => (
                <div key={service.id} className="service-admin-card">
                  <div className="service-admin-image">
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
                    <div className="service-actions">
                      <button className="service-action-btn edit" onClick={() => openEditModal(service)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="service-action-btn delete" onClick={() => openDeleteModal(service)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="service-admin-info">
                    <h4>{service.nama_layanan}</h4>
                    <p className="service-price">{formatPrice(service.harga)}</p>
                    <p className="service-duration"><i className="far fa-clock"></i> {service.durasi || "60 menit"}</p>
                    <p className="service-desc">{service.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Modal Tambah Layanan */}
            {isAddModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Tambah Layanan Baru</h2>
                  <form onSubmit={handleAddLayanan}>
                    <div className="form-group">
                      <label>Nama Layanan:</label>
                      <input
                        type="text"
                        name="nama_layanan"
                        value={currentLayanan.nama_layanan}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="deskripsi">Deskripsi:</label>
                      <textarea
                        id="deskripsi"
                        name="deskripsi"
                        value={currentLayanan.deskripsi}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Masukkan deskripsi layanan..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Harga (Rp):</label>
                      <input
                        type="text"
                        name="harga"
                        value={currentLayanan.harga}
                        onChange={handleInputChange}
                        required
                        placeholder="Contoh: 150000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Durasi (menit):</label>
                      <input
                        type="text"
                        name="durasi"
                        value={currentLayanan.durasi}
                        onChange={handleInputChange}
                        placeholder="Contoh: 60 menit"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="gambar">Gambar Layanan:</label>
                      <div className="custom-file-input">
                        <div className="file-input-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          {imageFile ? imageFile.name : "Pilih file gambar..."}
                        </div>
                        <input
                          type="file"
                          id="gambar"
                          name="gambar"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
                    <div className="modal-buttons">
                      <button type="submit" className="btn-save">
                        <i className="fas fa-save"></i> Simpan
                      </button>
                      <button type="button" className="btn-cancel" onClick={closeModals}>
                        <i className="fas fa-times"></i> Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Modal Edit Layanan */}
            {isEditModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Edit Layanan</h2>
                  <form onSubmit={handleEditLayanan}>
                    <div className="form-group">
                      <label>Nama Layanan:</label>
                      <input
                        type="text"
                        name="nama_layanan"
                        value={currentLayanan.nama_layanan}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="deskripsi-edit">Deskripsi:</label>
                      <textarea
                        id="deskripsi-edit"
                        name="deskripsi"
                        value={currentLayanan.deskripsi}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Masukkan deskripsi layanan..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Harga (Rp):</label>
                      <input
                        type="text"
                        name="harga"
                        value={currentLayanan.harga}
                        onChange={handleInputChange}
                        required
                        placeholder="Contoh: 150000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Durasi (menit):</label>
                      <input
                        type="text"
                        name="durasi"
                        value={currentLayanan.durasi}
                        onChange={handleInputChange}
                        placeholder="Contoh: 60 menit"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="gambar-edit">Gambar Layanan:</label>
                      <div className="custom-file-input">
                        <div className="file-input-label">
                          <i className="fas fa-cloud-upload-alt"></i>
                          {imageFile ? imageFile.name : "Pilih file gambar baru..."}
                        </div>
                        <input
                          type="file"
                          id="gambar-edit"
                          name="gambar"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      {imagePreview && (
                        <div className="image-preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
                    <div className="modal-buttons">
                      <button type="submit" className="btn-save">
                          <i className="fas fa-check"></i> Perbarui
                      </button>
                      <button type="button" className="btn-cancel" onClick={closeModals}>
                        <i className="fas fa-times"></i> Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Modal Hapus Layanan */}
            {isDeleteModalOpen && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Hapus Layanan</h2>
                  <div className="confirm-delete-content">
                    <div className="confirm-icon">
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <p>Apakah Anda yakin ingin menghapus layanan <strong>{currentLayanan.nama_layanan}</strong>?</p>
                    <p className="warning-text">Tindakan ini tidak dapat dibatalkan!</p>
                  </div>
                  <div className="modal-buttons">
                    <button className="btn-delete" onClick={handleDeleteLayanan}>
                      <i className="fas fa-trash"></i> Hapus
                    </button>
                    <button className="btn-cancel" onClick={closeModals}>
                      <i className="fas fa-times"></i> Batal
                    </button>
                  </div>
                </div>
              </div>
            )}
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
