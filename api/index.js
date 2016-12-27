const router = require('express').Router();

router.use(require('./leads-api'));
router.use(require('./payments-api'));

module.exports = router;
