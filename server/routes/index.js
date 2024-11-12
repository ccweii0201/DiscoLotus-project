var express = require('express');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // 確保返回 client 資料夾中的 index.html
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

module.exports = router;