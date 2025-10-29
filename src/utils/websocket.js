const { WebSocketServer } = require("ws");
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

  const [sessionId] = search.split("=")[1];
  
  let room;

  if(!rooms.has(boardId)) {
    room = getRoom(teamId, boardId);
    
    if(!room) {
      ws.send("team or board does not exist");
      return;
    }

    rooms.set(boardId, room);
  }

  room.handleSocketConnect({ sessionId, socket: ws})
}

module.exports = {
  createWebSocketServer
}