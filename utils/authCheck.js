const authCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect('/login');
  } else {
    return next();
  }
};

module.exports = authCheck;
