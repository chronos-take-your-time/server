const { WebSocketServer, WebSocket } = require("ws");
const { getRoom } = require("./tldraw");
const { TLSocketRoom } = require("@tldraw/sync-core");

/**
 * @type {Map<string, TLSocketRoom>}
 */
const rooms = new Map();

function createWebSocketServer(server){
  const wss = new WebSocketServer({server});

  wss.on("connection", handleConnection);
}

function handleConnection(ws, req){

  const {url} = req;

  const path = url.split("?")[0];
  const search = url.split("?")[1].split("&")[0];

  const [teamId, boardId] = path.slice(1).split("/");

  const sessionId = search.split("=")[1];
  
  let room;

  if(!rooms.has(boardId)) {
    room = getRoom(teamId, boardId);
    
    if(!room) {
      ws.send(JSON.stringify({status: 400, message: "team or board does not exist", resource: `board@${boardId}`}));
      return;
    }

    rooms.set(boardId, room);
  } else {
    room = rooms.get(boardId)
  }

}

module.exports = {
  createWebSocketServer
}