var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.send('this is the login');
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

router.get('/api', (req, res, next) => {
  res.send('this is the api');
});

router.get('/account', (req, res, next) => {
  res.send('this is your account page');
});

/* PATCH user info */
//router.patch('/account', authCheck, userController.update_username);

module.exports = router;
