const roleMiddleware = (roles) => {
  return (req, res, next) => {
    console.log('Role Middleware: Entering');
    if (!req.user) {
      console.log('Role Middleware: req.user is undefined, cannot check role');
      return res.status(401).json({ message: 'Unauthorized: User data not found' });
    }
    console.log(`Role Middleware: User role is '${req.user.role}', required roles are '${roles.join(', ')}'`);
    if (!roles.includes(req.user.role)) {
      console.log('Role Middleware: Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }
    console.log('Role Middleware: Access granted');
    next();
  };
};

module.exports = roleMiddleware;
