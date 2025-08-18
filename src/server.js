require('dotenv').config({ path: '../.env' });


const express = require('express');
const app = express();
const port = 3000;

// necessario para o parse dos jsons
app.use(express.json());

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
