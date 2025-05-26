const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send({
    message: `o chronos está rodando`,
  })
})

module.exports = router;
