const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Admin and Care Manager are most powerful and can access everything
    const superRoles = ['admin', 'caremanager'];
    if (superRoles.includes(req.user.role) || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: `Access denied. Role ${req.user.role} is not authorized.` });
  };
};

module.exports = { auth, authorizeRoles };
