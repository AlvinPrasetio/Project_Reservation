import { useState, useEffect } from "react";
import "../styles/AdminLayanan.css";
import { useNavigate } from "react-router-dom";

const AdminLayanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [currentLayanan, setCurrentLayanan] = useState({
    id: null,
    nama_layanan: "",
    deskripsi: "",
    harga: "",
    durasi: "",
  });

  // Format harga ke Rupiah
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return price.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    }
    return price;
  };

  useEffect(() => {
    // Cek apakah user adalah admin
    const authToken = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    if (!authToken || userRole !== "admin") {
      navigate("/login");
      return;
    }
    
    setToken(authToken);
    fetchLayanan(authToken);
  }, [navigate]);
  
  const fetchLayanan = async (authToken) => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/layanan", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Gagal mengambil data layanan");
      }
      
      const data = await response.json();
      setLayanan(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
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
  
  const openAddModal = () => {
    setCurrentLayanan({
      id: null,
      nama_layanan: "",
      deskripsi: "",
      harga: "",
      durasi: "",
    });
    setIsAddModalOpen(true);
  };
  
  const openEditModal = (layanan) => {
    setCurrentLayanan(layanan);
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
      const response = await fetch("http://localhost:5000/layanan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_layanan: currentLayanan.nama_layanan,
          deskripsi: currentLayanan.deskripsi,
          harga: parseFloat(currentLayanan.harga),
          durasi: currentLayanan.durasi,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menambahkan layanan");
      }
      
      // Refresh layanan dan tutup modal
      fetchLayanan(token);
      closeModals();
      
      alert("Layanan berhasil ditambahkan!");
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleEditLayanan = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5000/layanan/${currentLayanan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama_layanan: currentLayanan.nama_layanan,
          deskripsi: currentLayanan.deskripsi,
          harga: parseFloat(currentLayanan.harga),
          durasi: currentLayanan.durasi,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mengupdate layanan");
      }
      
      // Refresh layanan dan tutup modal
      fetchLayanan(token);
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
      fetchLayanan(token);
      closeModals();
      
      alert("Layanan berhasil dihapus!");
    } catch (error) {
      alert(error.message);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="admin-container">
      <h1>Kelola Layanan Salon</h1>
      
      <button className="btn-add" onClick={openAddModal}>
        <i className="fas fa-plus"></i> Tambah Layanan Baru
      </button>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Layanan</th>
              <th>Harga</th>
              <th>Durasi</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {layanan.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.nama_layanan}</td>
                <td>{formatPrice(item.harga)}</td>
                <td>{item.durasi}</td>
                <td>
                  {item.deskripsi && item.deskripsi.length > 50
                    ? `${item.deskripsi.substring(0, 50)}...`
                    : item.deskripsi}
                </td>
                <td className="action-buttons">
                  <button className="btn-edit" onClick={() => openEditModal(item)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn-delete" onClick={() => openDeleteModal(item)}>
                    <i className="fas fa-trash"></i> Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <label>Deskripsi:</label>
                <textarea
                  name="deskripsi"
                  value={currentLayanan.deskripsi}
                  onChange={handleInputChange}
                  rows={4}
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
                />
              </div>
              <div className="form-group">
                <label>Durasi (menit):</label>
                <input
                  type="text"
                  name="durasi"
                  value={currentLayanan.durasi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-save">
                  Simpan
                </button>
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Batal
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
                <label>Deskripsi:</label>
                <textarea
                  name="deskripsi"
                  value={currentLayanan.deskripsi}
                  onChange={handleInputChange}
                  rows={4}
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
                />
              </div>
              <div className="form-group">
                <label>Durasi (menit):</label>
                <input
                  type="text"
                  name="durasi"
                  value={currentLayanan.durasi}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-save">
                  Perbarui
                </button>
                <button type="button" className="btn-cancel" onClick={closeModals}>
                  Batal
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
            <p>Apakah Anda yakin ingin menghapus layanan {currentLayanan.nama_layanan}?</p>
            <div className="modal-buttons">
              <button className="btn-delete" onClick={handleDeleteLayanan}>
                Hapus
              </button>
              <button className="btn-cancel" onClick={closeModals}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayanan; 