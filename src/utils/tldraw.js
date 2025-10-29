const { TLSocketRoom } = require("@tldraw/sync-core");
const {
  createTLSchema,
  defaultBindingSchemas,
  defaultShapeSchemas,
} = require("@tldraw/tlschema");
const { getBoard, updateBoardContent } = require("../controllers/boards");
const throttle = require("lodash.throttle");

/**
 * Returns a new TLSocketRoom with default schemas and a timeout of 30s
 * @param {string} teamId 
 * @param {string} boardId 
 * @returns {TLSocketRoom}
 */
function getRoom(teamId, boardId) {
  const schema = createTLSchema({
    bindings: defaultBindingSchemas,
    shapes: defaultShapeSchemas,
  });

  const response = getBoard(teamId, boardId);

  if(response.status == 400) return null;

  const room = new TLSocketRoom({
    schema,
    clientTimeout: 30000,
    initialSnapshot: response.data.content,
    onDataChange: throttle(()=>{
      const currentSnapshot = room.getCurrentSnapshot();

      updateBoardContent(teamId, boardId, currentSnapshot);

    }, 1000)
  });

  return room;
}

module.exports = {
  getRoom,
};
