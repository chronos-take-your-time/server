require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;


// routes
const rootRouter = require('./routes/root');
const teamRouter = require('./routes/teams');
const boardRouter = require('./routes/boards');
app.use('/', rootRouter);
app.use('/teams', teamRouter);
app.use('/boards', boardRouter);

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});
