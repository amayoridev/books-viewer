const requireAuth = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    return res.redirect('/');
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) {
      return next();
    } else {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.session.user?.role;
    const permissions = {
      read: ['user', 'partner', 'admin'],
      upload: ['partner', 'admin'],
      delete: ['admin'],
      manage: ['admin'],
      moderate: ['admin']
    };

    if (userRole && permissions[permission]?.includes(userRole)) {
      return next();
    } else {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
  };
};

module.exports = { requireAuth, requireRole, requirePermission };