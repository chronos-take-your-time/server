const express = require('express');
const router = express.Router();

router.get('/ola/:name', (req, res) => {
  const name = req.params.name
  const now = new Date()

  res.status(200).send({
    message: `olá, ${name}!`,
    timestamp: now.toJSON(),
  })
})

module.exports = router;
