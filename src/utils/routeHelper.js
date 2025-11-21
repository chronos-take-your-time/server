require("dotenv").config();
const { handleResponse } = require('./output');
const { memberOnly } = require('./clerk');
const { verifyToken } = require('@clerk/backend');

/**
* Helper with the base structure for these routes
*
* @param {string} req - Requisition object.
* @param {string} res - Response object.
* @param {Object} action - A function to be executed.
* @returns {Promise<Object>} The result of the operation.
*/
async function routeHelper(req, res, action, admin=false) {
  
  try {
    const { token } = req.query;
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, clockSkewInMs: 30000 });
    const userId = payload.sub; 

    // if the route needs a team check
    const teamId = req.params.teamId ? req.params.teamId : 'empty';
    if (teamId != "empty") {
      await memberOnly(userId, teamId, res, admin);
    }
  
    return action();
  } catch (err) {
    console.log("Route helper error:", err.message);
  }
}

module.exports = {
  routeHelper
};