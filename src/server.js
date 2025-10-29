require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors'); 
const { withAuth, clerkClient } = require('./utils/clerk');

const app = express();
const port = 3000;

app.use(express.json({limit: "50mb"}));
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    credentials: true,
}));

app.use(withAuth()); 

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
