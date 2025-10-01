require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3000;

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Accept, Host, Origin, Referer, Sec-Fetch-Dest, User-Agent, X-Forwarded-Host, X-Forwarded-Proto',
    credentials: true,
}));


app.use(express.json());

const rootRouter = require('./routes/root');
const teamRouter = require('./routes/teams');
const boardRouter = require('./routes/boards');

app.use('/', rootRouter);
app.use('/teams', teamRouter);
app.use('/boards', boardRouter);

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});