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

/**
 * 
 * @param {WebSocket} ws 
 * @param {*} req 
 * @returns 
 */

let mutex = Promise.resolve(null);

async function handleConnection(ws, req){
  
  mutex = mutex.then(
    async () => {
      const {url} = req;
    
      const path = url.split("?")[0];
      const search = url.split("?")[1].split("&")[0];
    
      const [teamId, boardId] = path.slice(1).split("/").map((el)=>decodeURIComponent(el));
    
      const sessionId = search.split("=")[1];
      
      let room;
    
      if(!rooms.has(boardId)) {
        room = getRoom(teamId, boardId);
        
        if(!room) {
          return;
        }
        
        rooms.set(boardId, room);
    
      } else {
        room = rooms.get(boardId)
      }
    
      room.handleSocketConnect({sessionId, socket: ws})
    
      const verifyIsClosed = setInterval(()=>{
        if(room.isClosed()) {
          rooms.delete(boardId);
        }
      }, 1000);

      ws.on("close", ()=> {
        return clearInterval(verifyIsClosed);
      })
    }
  )

}

module.exports = {
  createWebSocketServer
}