const { createClerkClient } = require('@clerk/backend');
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
console.log(process.env.CLERK_SECRET_KEY)
module.exports = clerkClient;
