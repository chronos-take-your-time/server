// this function handles the response for API requests based in output.js.

const { humanOutput } = require('./output');

/**
 * Handles the HTTP response by sending a JSON response based on the result status using humanOutput.
 *
 * @param {object} res - The Express response object.
 * @param {object} result - The result object containing status, message, and resource.
 * @param {string} result.status - The status of the operation ('success' or other).
 * @param {string} result.message - The message to send in the response.
 * @param {*} result.resource - The resource to include in the response.
 * @returns {object} The response sent to the client.
 */
function handleResponse(res, result) {
  humanOutput(result.status, result.message, result.resource);
  if (result.status != 'success') {
    return res.status(400).json({ error: result.message, resource: result.resource });
  }
  return res.json({ message: result.message, resource: result.resource });
}

module.exports = handleResponse;
