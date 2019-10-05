var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { id: '' });
});

router.get('/view/:id', function (req, res, next) {
  res.render('index', { id: req.params.id });
});

module.exports = router;
