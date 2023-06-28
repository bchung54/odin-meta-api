var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.send('this is the login');
});

router.get('/logout', (req, res, next) => {
  res.send('this is the logout');
});

module.exports = router;
