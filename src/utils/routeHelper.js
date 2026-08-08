require("dotenv").config();
const { memberOnly, adminOnly } = require('./clerk');
const { verifyToken } = require('@clerk/backend');

/**
* Helper with the base structure for these routes
*
* @param {Object} req - Request object.
* @param {Object} res - Response object.
* @param {Function} action - A function to be executed.
* @param {boolean} [admin=false] - Requires admin privileges.
* @returns {Promise<any>} The result of the operation.
*/
async function routeHelper(req, res, action, admin = false) {
  try {
    const { token } = req.query;
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, clockSkewInMs: 30000 });
    const userId = payload.sub;

    const teamId = req.params.teamId;

    if (teamId) {
      const authResponse = admin
        ? await adminOnly(userId, teamId, res)
        : await memberOnly(userId, teamId, res);

      if (authResponse) {
        return authResponse;
      }
    }

    return action();
  } catch (err) {
    console.error("Route helper error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  routeHelper
};