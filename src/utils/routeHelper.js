const { handleResponse } = require('./output');
const { memberOnly } = require('./clerk');

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
    const { userId } = req.auth;
    const teamId = req.params.teamId ? req.params.teamId : 'empty';

    // if the routes needs user to be in the team
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