import express from 'express';
import { matchRouter } from './routes/matches.js';

const app = express();
const port = 8000;

// JSON 형식의 데이터를 자바스크립트 객체로 변환
app.use(express.json());

// 클라이언트가 루트 경로(http://localhost:8000/)에 접속을 요청하면 응답으로 'Hello from Express server!' 문자열을 보냄
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

app.use('/matches', matchRouter)

// 지정한 포트에서 실제로 서버를 가동
// 서버가 성공적으로 가동하면 콜백함수 실행
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
