const { TLSocketRoom } = require("@tldraw/sync-core");
const {
  createTLSchema,
  defaultBindingSchemas,
  defaultShapeSchemas,
} = require("@tldraw/tlschema");
const { getBoard, updateBoardContent } = require("../controllers/boards");

/**
 * Returns a new TLSocketRoom with default schemas and a timeout of 30s
 * @returns {TLSocketRoom}
 */
function getRoom(teamId, boardId) {
  const schema = createTLSchema({
    bindings: defaultBindingSchemas,
    shapes: defaultShapeSchemas,
  });

  const board = getBoard(teamId, boardId);

  const room = new TLSocketRoom({
    schema,
    clientTimeout: 30000,
    initialSnapshot: board?.data?.content,
    onDataChange: ()=>{
      const currentSnapshot = room.getCurrentSnapshot();
      //console.log(currentSnapshot)
      updateBoardContent(teamId, boardId, currentSnapshot);
    }
  });

  return room;
}

module.exports = {
  getRoom,
};
