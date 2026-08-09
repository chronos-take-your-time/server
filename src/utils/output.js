function humanOutput(type, message, entity = "") {
  const prefixes = {
    200: "[OK]", 201: "[ACCEPTED]", 204: "[NO CONTENT]",
    400: "[BAD REQUEST]", 401: "[UNAUTHORIZED]", 403: "[FORBIDDEN]",
    404: "[NOT FOUND]", 409: "[CONFLICT]", 422: "[UNPROCESSABLE]",
    500: "[SERVER ERROR]", info: "[INFO]", success: "[SUCCESS]", error: "[ERROR]"
  };

  const entityPart = entity ? `${entity} ` : '';
  console.log(`${prefixes[type] || '[ ]'} ${entityPart}${message}`);
}

function handleResponse(res, result, shutup = false) {
  if (!shutup) humanOutput(result.status, result.message, result.resource);

  return res.status(result.status).json({
    message: result.message,
    data: result.data,
    resource: result.resource,
  });
}

module.exports = { handleResponse, humanOutput };
