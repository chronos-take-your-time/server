import { createClerkClient } from '@clerk/backend'

// setup app
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

// clerk
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

app.listen(port, () => { console.debug(`[SUCCESS]: Chronos listening on port ${port}`) });
