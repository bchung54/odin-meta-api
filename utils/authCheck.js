const authCheck = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  return next();
};

module.exports = authCheck;
