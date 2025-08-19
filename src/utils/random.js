/**
 * Return an random id used for a board.
 *
 * @returns {string} UUID format like:
 * '62b53b8f-3950-4d4b-a2c9-f7b2c0f65b8e'
 */
function getRandomBoardId() {
  return crypto.randomUUID();
}

module.exports = { getRandomBoardId };
