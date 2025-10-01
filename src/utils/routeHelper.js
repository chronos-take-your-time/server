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
    const { teamId } = req.params;
    await memberOnly(userId, teamId, admin);
    const result = action;
    handleResponse(res, result);
  } catch (err) {
    handleResponse(res, { status: 401, message: 'unauthorized without clerk session', resource: err.message });
  }
}

module.exports = {
  routeHelper
};