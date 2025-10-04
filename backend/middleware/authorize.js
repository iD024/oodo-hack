const authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') or an array of roles (e.g., ['admin', 'manager'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have the required permissions' });
    }
    next();
  };
};

module.exports = { authorize };