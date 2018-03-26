const { join } = require('path');

const express = require('express');

const router = express.Router();

router.use('/', express.static(join(__dirname, '..', 'views')));

module.exports = router;
