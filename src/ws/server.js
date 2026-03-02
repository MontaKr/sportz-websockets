import { WebSocketServer } from "ws";

// WebSocket이 OPEN이 아니면 종료,
// JSON 형식으로 변환하여 전송하는 헬퍼 함수
function sendJson(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

// 모든 연결된 유저에게 데이터를 전송
function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) return;

    client.send(JSON.stringify(payload));
  }
}

export function attachWebSocketServer(server) {
  // 하나의 주소에서 일반API 요청과 웹소켓 통신을 처리하도록 연결
  const wss = new WebSocketServer({
    server,
    // 웹소켓 연결 주소
    path: "/ws",
    // 한번에 처리할 수 있는 웹소켓 메시지 크기
    maxPayload: 1024 * 1024, // 1MB
  });

  // 웹소켓이 연결되면 클라이언트에게 메시지 전송
  wss.on("connection", (socket) => {
    sendJson(socket, { type: "welcome" });

    socket.on("error", console.error);
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: "match_created", data: match });
  }

  return { broadcastMatchCreated };
}
