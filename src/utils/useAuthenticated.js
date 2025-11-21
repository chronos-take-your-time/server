require('dotenv').config();
async function fetchAuthenticated(url, options) {
  const token = process.env.TEST_USER_TOKEN;

  if (!token) { return { status: 400, message: 'missing TEST_USER_TOKEN in .env'} };

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return res;
}

module.exports = {
  fetchAuthenticated
};