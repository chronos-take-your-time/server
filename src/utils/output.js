/**
 * Console output made readable for humans.
 * @param {'success'|'error'|'info'} type - Message type
 * @param {string} message - Main message content
 * @param {string} [entity] - Optional entity identifier (e.g., "team@123")
 */
function humanOutput(type, message, entity="") {
  // Define prefixes for different message types based in HTTP status codes and standard types
  const prefixes = {
    200: "[OK]",
    201: "[ACCEPTED]",
    204: "[NO CONTENT]",
    400: "[BAD REQUEST]",
    401: "[UNAUTHORIZED]",
    403: "[FORBIDDEN]",
    404: "[NOT FOUND]",
    409: "[CONFLICT]",
    422: "[UNPROCESSABLE]",
    500: "[SERVER ERROR]",
    info: "[INFO]",
    success: "[SUCCESS]",
    error: "[ERROR]"
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
function handleResponse(res, result, shutup = false) {
  if (!shutup) humanOutput(result.status, result.message, result.resource);

  return res
  .status(result.status)
  .json({
    message: result.message,
    data: result.data,
    resource: result.resource,
  });
}

module.exports = {
  handleResponse,
  humanOutput
};