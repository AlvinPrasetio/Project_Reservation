// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware untuk autentikasi token JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
    }
    
    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET || 'rahasia123', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token tidak valid' });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error pada middleware autentikasi:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Middleware untuk memeriksa role admin
 */
const authorizeAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Akses ditolak, hanya untuk admin' });
    }
  });
};

module.exports = { authenticate, authorizeAdmin };
