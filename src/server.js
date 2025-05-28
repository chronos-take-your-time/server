import { createClerkClient } from '@clerk/backend'

const express = require('express');
const app = express();
const port = 3000;

// routes
const rootRouter = require('./routes/root');
const olaRouter = require('./routes/ola');
app.use('/', rootRouter);
app.use('/ola', olaRouter);

// clerk
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

app.listen(port, () => {
  console.debug(`[SUCCESS]: Chronos listening on port ${port}`);
});
