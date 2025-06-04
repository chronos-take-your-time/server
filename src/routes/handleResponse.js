// this function handles the response for API requests based in output.js.

const { humanOutput } = require('../utils/output');

function handleResponse(res, result) {
  humanOutput(result.status, result.message, result.resource);
  if (result.status != 'success') {
    return res.status(400).json({ error: result.message, resource: result.resource });
  }
  return res.json({ message: result.message, resource: result.resource });
}

module.exports = handleResponse;
