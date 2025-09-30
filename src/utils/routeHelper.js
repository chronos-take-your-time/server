const { handleResponse } = require('./output');
const { memberOnly } = require('./output');

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
    req.auth;
  } catch (err) {
    handleResponse(res, { status: 401, message: 'unauthorized without clerk session', resource: err.message });
  }
  const { userId } = req.auth;
  const { teamId } = req.params;
  memberOnly(userId, teamId, admin);
  const result = action;
  handleResponse(res, result);
}

module.exports = {
  routeHelper
};