const express = require('express');
const app = express();
const router = express.Router();

app.get('/ola/:name', (req, res) => {
  const name = req.params.name
  const now = new Date()

  res.status(200).send({
    message: `olá, ${name}!`,
    timestamp: now.toJSON(),
  })
})

module.exports = router;