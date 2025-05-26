const express = require('express');
const app = express();
const port = 3000;

const olaRoutes = require('./routes/ola');

app.use('/ola', olaRoutes);

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});
