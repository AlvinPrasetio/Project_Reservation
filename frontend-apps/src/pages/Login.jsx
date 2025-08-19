import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Validasi
    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }
      
      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      
      // Simpan data pengguna ke localStorage
      if (data.user) {
        localStorage.setItem('userName', data.user.nama || '');
        localStorage.setItem('userEmail', data.user.email || '');
        localStorage.setItem('userRole', data.user.role || 'user');
      }

      // Redirect sesuai role
      if (data.user && data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal, periksa kembali email dan password Anda');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setForgotPasswordLoading(true);

    // Validasi email
    if (!forgotEmail) {
      setError('Email harus diisi');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim email reset password');
      }

      // Tampilkan pesan sukses
      setSuccessMessage('Link reset password telah dikirim ke email Anda');
      // Reset form dan tutup modal
      setForgotEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 3000);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Gagal mengirim email reset password');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-header">Selamat Datang</h2>
          <p className="auth-subtitle">Login untuk melakukan reservasi layanan</p>
          
          {error && <div className="auth-error">{error}</div>}
          {successMessage && <div className="auth-success">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email anda"
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <FiLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
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
              <div className="forgot-password">
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Lupa Password?
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </form>
          
          <p className="auth-footer">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </div>
      </div>

      {/* Modal Lupa Password */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowForgotPassword(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Masukkan alamat email yang terdaftar untuk menerima link reset password.</p>
              {error && <div className="auth-error">{error}</div>}
              {successMessage && <div className="auth-success">{successMessage}</div>}
              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label htmlFor="forgotEmail">Email</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Masukkan email anda"
                      disabled={forgotPasswordLoading}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="auth-button"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
