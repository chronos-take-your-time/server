const { humanOutput } = require('./output');

async function fetchAuthenticated(url, options) {
  const token = process.env.TEST_USER_TOKEN;

  if (!token) { return humanOutput(400, 'missing TEST_USER_TOKEN in .env') };

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

module.exports = {
  fetchAuthenticated
};