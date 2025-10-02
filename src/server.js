require('dotenv').config({ path: '../.env' });
const { withAuth } = require('./utils/clerk');
const { clerkMiddleware } = require('@clerk/express');

const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3000;

app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Accept, Host, Origin, Referer, Sec-Fetch-Dest, User-Agent, X-Forwarded-Host, X-Forwarded-Proto',
    credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

const rootRouter = require('./routes/root');
const teamRouter = require('./routes/teams');
const boardRouter = require('./routes/boards');

app.use('/', withAuth, rootRouter);
app.use('/teams', withAuth, teamRouter); 
app.use('/boards', withAuth, boardRouter); 


app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});