/**
 * @file Board Controller
 * @description Handles filesystem operations for board creation, deletion, and management.
 * @see {@link https://chronos-take-your-time.github.io/wiki/arquitetura/servidor/dados/} for details
 */

const fs = require("fs");
const path = require("path");
const { baseDir, getTeamPath, getBoardPath } = require("../controllers/helper");

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

/**
 * Creates a new board JSON file inside a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {Object} [boardData={}] - Data object to be saved as JSON
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * createBoard('team123', 'board456', { name: 'jj' });
 * createBoard('team123', 'board456', { name: 'jj' }, '/tmp/test-dir');
 */
function createBoard(teamId, boardId, boardData, customBaseDir) {
  const teamPath = getTeamPath(teamId, customBaseDir);

  // if teampath does not exists
  if (!fs.existsSync(teamPath)) {
    return {
      status: 400,
      message: "team path does not exist (consider create it)",
      resource: `team@${teamId}`,
    };
  }

  // write file inside teamPath
  const boardPath = path.join(teamPath, `${boardId}.json`);
  fs.writeFileSync(
    boardPath,
    boardData === undefined ? JSON.stringify({}) : boardData, null, 2 // if there is no data write an empty json
  );

  return {
    status: 201,
    message: `created at team@${teamId}`,
    resource: `board@${boardId}`,
  };
}

/**
 * Return a board JSON file
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and data of the board or error message
 * @example
 * getBoard('team123', 'board456');
 * getBoard('team123', 'board456', '/tmp/test-dir');
 */
function getBoard(teamId, boardId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const boardPath = path.join(root, teamId, `${boardId}.json`);

  try {
    const data = fs.readFileSync(boardPath, "utf-8");
    return {
      status: 202,
      data: JSON.parse(data),
      resource: `board@${boardId}`,
    };
  } catch {
    return {
      status: 400,
      message: "not found or invalid JSON",
      resource: `board@${boardId}`,
    };
  }
}

/**
 * Update the content of an existing board
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identfier
 * @param {{type: string, data: any[] | {any} }} newData - New data to add to the board
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 */
function updateBoardContent(teamId, boardId, newContent, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);

  try {
    const data = JSON.parse(fs.readFileSync(boardPath, "utf-8"));

    fs.writeFileSync(boardPath, JSON.stringify({ ...data, content: newContent }));

    return {
      status: 202,
      message: `updated at board@${boardId}`,
      resource: `board@${boardId}`,
    };
  } catch {
    return {
      status: 400,
      message: "not found or invalid JSON",
      resource: `board@${boardId}`,
    };
  }
}

/**
 * Upload an asset (image or video) as a dataURL into board JSON
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identifier
 * @param {{id: string, dataURL: string}} asset - Asset (image or video) to upload
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation 
 */
function uploadBoardAsset(teamId, boardId, asset, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);

  try {
    const data = JSON.parse(fs.readFileSync(boardPath, "utf-8"));

    fs.writeFileSync(boardPath, JSON.stringify({ ...data, assets: [...data.assets, asset] }));

    return {
      status: 200,
      message: `asset uploaded at board@${boardId}`,
      resource: `board@${boardId}`
    }
  } catch {
    return {
      status: 400,
      message: `invalid asset or board not founded`,
      resource: `board@${boardId}`
    }
  }
}
/**
 * Return an asset dataURL 
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Unique board identfier
 * @param {string} assetId - Asset identifier
 * @param {string} [customBaseDir]
 * @returns {Object} - Status and asset
 */
function getBoardAsset(teamId, boardId, assetId, customBaseDir) {
  const boardPath = getBoardPath(teamId, boardId, customBaseDir);

  try {
    const data = JSON.parse(fs.readFileSync(boardPath, "utf-8"));

    const asset = data.assets.find((value)=> value.id == assetId);

    if(!asset) 
      return { 
        status: 400, 
        message: "asset not found", 
        resource: `board@${boardId}` 
      }

    return {
      status: 200,
      data: asset.dataURL,
      resource: `board@${boardId}`
    }
  } catch {
    return {
      status: 400,
      message: "not found",
      resource: `board@${boardId}`
    }
  }
}

/**
 * Deletes a board JSON file from a team directory
 * @param {string} teamId - Team identifier
 * @param {string} boardId - Board identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Object} - Status and message of the operation
 * @example
 * deleteBoard('team123', 'board456');
 * deleteBoard('team123', 'board456', '/tmp/test-dir');
 */
function deleteBoard(teamId, boardId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const boardPath = path.join(root, teamId, `${boardId}.json`);

  if (fs.existsSync(boardPath)) {
    fs.unlinkSync(boardPath);
    return {
      status: 202,
      message: `deleted at team@${teamId}`,
      resource: `board@${boardId}`,
    };
  }

  return {
    status: 400,
    message: `board does not exist`,
    resource: `team@${teamId}.board@${boardId}`,
  };
}

/**
 * Lists all boards in a team directory
 * @param {string} teamId - Team identifier
 * @param {string} [customBaseDir] - Optional base directory (mainly for testing)
 * @returns {Array<Object>} - List of boards with their IDs
 */
function getTeamBoards(teamId, customBaseDir) {
  const root = customBaseDir || baseDir;
  const teamPath = path.join(root, teamId);

  if (!fs.existsSync(teamPath)) {
    return { status: 400, message: `board does not exist`, resource: `team@${teamId}` };
  }

  const files = fs.readdirSync(teamPath);
  const boards = files.filter(file => file.endsWith('.json')).map(file => ({ boardId: path.basename(file, '.json'), data: getBoard(teamId, path.basename(file, '.json')).data }));


  return { status: 200, data: boards, resource: `team@${teamId}` };
}


module.exports = {
  createBoard,
  getBoard,
  updateBoardContent,
  getBoardAsset,
  uploadBoardAsset,
  deleteBoard,
  getTeamBoards,
};
