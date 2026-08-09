require("dotenv").config();
const { memberOnly, adminOnly } = require('./clerk');
const { handleResponse } = require('./output');
const { verifyToken } = require('@clerk/backend');

async function routeHelper(req, res, action, admin = false) {
  try {
    const { token } = req.query;
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY, clockSkewInMs: 30000 });
    const userId = payload.sub;
    const { teamId } = req.params;

    if (teamId) {
      const authResponse = admin
        ? await adminOnly(userId, teamId, res)
        : await memberOnly(userId, teamId, res);

      if (authResponse) return authResponse;
    }

    return action();
  } catch (err) {
    let message = 'This is the wrong way to call Chronos API, check out https://github.com/chronos-take-your-time/server for more information.';
    if (err.reason == 'token-invalid') {
      message = 'You are not logged in in Chronos, please use the oficial Chronos Desktop Application.';
    }
    handleResponse(res, { status: 500, message });
  }
}

module.exports = { routeHelper };
