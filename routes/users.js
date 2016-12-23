let express = require('express');
let router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(422).json({"Message": "INVALID API"});
});
router.get('/api', function(req, res, next) {
  res.status(422).json({"Message": "INVALID API"});
});
module.exports = router;
