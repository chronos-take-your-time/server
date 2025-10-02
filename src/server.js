require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors'); 
const { clerkMiddleware } = require('@clerk/express');
const { withAuth } = require('./utils/clerk');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
}));

app.use(clerkMiddleware());
app.use(withAuth()); 

const rootRouter = require('./routes/root');
const teamRouter = require('./routes/teams');
const boardRouter = require('./routes/boards');

app.use('/', rootRouter);
app.use('/teams', teamRouter); 
app.use('/boards', boardRouter); 

app.listen(port, () => {
    console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});
