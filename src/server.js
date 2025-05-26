const express = require('express');
const app = express();
const port = 3000;

const rootRouter = require('./routes/root');
const olaRouter = require('./routes/ola');

app.use('/', rootRouter);
app.use('/ola', olaRouter);

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});
