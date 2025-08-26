/**
 * Console output made readable for humans.
 * @param {'success'|'error'|'info'} type - Message type
 * @param {string} message - Main message content
 * @param {string} [entity] - Optional entity identifier (e.g., "team@123")
 */
function humanOutput(type, message, entity="") {
  const prefixes = {
    success: "[SUCCESS]",
    error: "[ERROR]",
    info: "[INFO]"
  };

  const entityPart = entity ? `${entity} ` : '';
  console.log(`${prefixes[type] || '[ ]'} ${entityPart}${message}`);
}

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
function handleResponse(res, result, code=undefined) {
  humanOutput(result.status, result.message, result.resource);

  // Handle cases without specific HTTP status code
  if (code == undefined) {
    if (result.status != 'success') {
      return res.status(400).json({ error: result.message, resource: result.resource });
    }
    return res.json({ message: result.message, resource: result.resource });
  }
  return res.status(code).json({ message: result.message, resource: result.resource });
}

module.exports = {
  handleResponse,
  humanOutput
};