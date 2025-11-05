require('dotenv').config({ path: '../.env' });
const { clerkMiddleware } = require('@clerk/express');
const { clerkClient } = require('./utils/clerk');
const express = require('express');
const cors = require('cors'); 

const app = express();
const port = 3000;

app.use(express.json({limit: "500mb"}));
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
}));

const rootRouter = require('./routes/root');
const teamRouter = require('./routes/teams');
const boardRouter = require('./routes/boards');
const { createWebSocketServer } = require('./utils/websocket');

app.use('/', rootRouter);
app.use('/teams', teamRouter); 
app.use('/boards', boardRouter); 

const server = app.listen(port, () => {
    console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});

createWebSocketServer(server);
