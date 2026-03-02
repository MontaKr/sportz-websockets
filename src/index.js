import express from "express";
import http from "http";
import { matchRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

// HTTP 서버 생성
const server = http.createServer(app);

// JSON 형식의 데이터를 자바스크립트 객체로 변환
app.use(express.json());

// 클라이언트가 루트 경로(http://localhost:8000/)에 접속을 요청하면 응답으로 'Hello from Express server!' 문자열을 보냄
app.get("/", (req, res) => {
  res.send("Hello from Express server!");
});

app.use("/matches", matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// 지정한 포트에서 실제로 서버를 가동
// 서버가 성공적으로 가동하면 콜백함수 실행
server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(
    `WebSocket server is running on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
