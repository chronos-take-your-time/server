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
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const { userId } = await verifyToken(token, {secretKey: process.env.CLERK_SECRET_KEY});

    const teamId = req.params.teamId ? req.params.teamId : 'empty';

    if (teamId != "empty") {
      await memberOnly(userId, teamId, res, admin);
    }
    
    return action();
  } catch (err) {
    handleResponse(res, { status: 401, message: 'unauthorized', resource: err.message });
  }
}

module.exports = {
  routeHelper
};