import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  // Verifikasi token saat komponen dimuat
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/auth/verify-token/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setError(data.message || 'Token tidak valid atau sudah kadaluarsa');
        }
      } catch (error) {
        setIsTokenValid(false);
        setError('Gagal memverifikasi token');
        console.error('Token verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validasi
    if (!password || !confirmPassword) {
      setError('Semua field harus diisi');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengubah password');
      }
      
      setSuccess('Password berhasil diubah. Anda akan diarahkan ke halaman login...');
      
      // Redirect ke login setelah beberapa detik
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Tampilkan loading saat verifikasi token
  if (isTokenValid === null) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="auth-header">Memverifikasi Token</h2>
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan error jika token tidak valid
  if (isTokenValid === false) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h2 className="auth-header">Link Tidak Valid</h2>
            <div className="auth-error">{error}</div>
            <p className="auth-message">
              Link reset password sudah kadaluarsa atau tidak valid.
              Silakan <Link to="/login">kembali ke halaman login</Link> dan coba lagi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-header">Reset Password</h2>
          <p className="auth-subtitle">Buat password baru untuk akun Anda</p>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Password Baru</label>
              <div className="password-input-container">
                <FiLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Konfirmasi Password</label>
              <div className="password-input-container">
                <FiLock className="input-icon" />
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  disabled={loading}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </form>
          
          <p className="auth-footer">
            Kembali ke <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 