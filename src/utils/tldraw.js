const { TLSocketRoom } = require("@tldraw/sync-core");
const {
  createTLSchema,
  defaultBindingSchemas,
  defaultShapeSchemas,
} = require("@tldraw/tlschema");

/**
 * Returns a new TLSocketRoom with default schemas and a timeout of 30s
 * @returns {TLSocketRoom}
 */
function getRoom() {
  const schema = createTLSchema({
    bindings: defaultBindingSchemas,
    shapes: defaultShapeSchemas,
  });

  const room = new TLSocketRoom({ schema, clientTimeout: 30000 });

  return room;
}

module.exports = {
  getRoom
}