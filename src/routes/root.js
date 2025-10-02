const express = require('express');
const router = express.Router();
const { routeHelper } = require('../utils/routeHelper');
const { handleResponse } = require('../utils/output');

router.get('/', (req, res) => {
  routeHelper(req, res, () => {
    handleResponse(res, { status: 200, message: 'chronos is running at 3000' });
  })
})

module.exports = router;
