const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send({
    message: `chronos is running at 3000`,
  })
})

module.exports = router;
