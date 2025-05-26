const express = require('express');
const app = express();
const router = express.Router();

app.get('/', (req, res) => {
  res.status(200).send({
    message: `o chronos está rodando`,
  })
})

module.exports = router;