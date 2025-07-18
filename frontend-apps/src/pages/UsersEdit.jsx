import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/UsersEdit.css";

const UsersEdit = () => {
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "";
    const storedEmail = localStorage.getItem("userEmail") || "";
    setNama(storedName);
    setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nama || !email) {
      setError("Nama dan email harus diisi");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const body = { nama, email };
      if (password) {
        body.password = password;
      }

      const response = await fetch("http://localhost:5000/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal memperbarui profil");
        setIsLoading(false);
        return;
      }

      // Update localStorage with new user data
      localStorage.setItem("userName", data.user.nama);
      localStorage.setItem("userEmail", data.user.email);

      setSuccess("Profil berhasil diperbarui");
      setIsLoading(false);

      // Navigate back to /users after short delay
      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch {
      setError("Terjadi kesalahan saat memperbarui profil");
      setIsLoading(false);
    }
  };

  return (
    <div className="users-edit-container">
      <h1 className="edit-profile-title">Edit Profil</h1>
      <form onSubmit={handleSubmit} className="users-edit-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <label htmlFor="nama">Nama:</label>
        <input
          type="text"
          id="nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password Baru (opsional):</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kosongkan jika tidak ingin mengubah password"
          style={{ whiteSpace: 'normal' }}
        />

        <label htmlFor="confirmPassword">Konfirmasi Password:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Konfirmasi password baru"
          style={{ whiteSpace: 'normal' }}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
};

export default UsersEdit;
