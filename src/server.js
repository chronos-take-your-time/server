require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors'); 
const { clerkMiddleware } = require('@clerk/express');
const { withAuth } = require('./utils/clerk');

const app = express();
const port = 3000;

app.use(express.json({limit: "50mb"}));
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
const { WebSocketServer } = require('ws');
const { getRoom } = require('./utils/tldraw');

app.use('/', rootRouter);
app.use('/teams', teamRouter); 
app.use('/boards', boardRouter); 

const server = app.listen(port, () => {
    console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});


const ws = new WebSocketServer({server});

ws.on("connection", (ws, req)=>{

    const url = new URL("http://complete.url" + req.url);

    const { sessionId } = url.searchParams;

    const [teamId, boardId] = url.pathname.slice(1).split("/")

    const room = getRoom();

    room.handleSocketConnect({sessionId, socket: ws});
})