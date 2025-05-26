const express = require('express');
const app = express();
const port = 3000;

const rootRoute = require('./routes/ola');
const olaRoute = require('./routes/ola');

app.use('/', rootRoute);
app.use('/ola', olaRoute);

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});


