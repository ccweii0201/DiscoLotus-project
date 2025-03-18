var createError = require('http-errors');
// var express = require('express');
const express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { v4: uuidv4 } = require('uuid');  // 引入 uuid 模組
const WebSocket = require('ws');
const http = require('http');
const port = process.env.PORT || 3000;
const axios = require("axios");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = http.createServer(app);
const ws_unity = new WebSocket.Server({ noServer: true });
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/unity') {
    ws_unity.handleUpgrade(request, socket, head, (ws) => {
      ws_unity.emit('connection', ws, request);
    });
  } else {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

let waterfallLevel = 4;
let unityClient = null;
let unity_Text;
const heartbeatInterval = 30000;
//websocket ->web
wss.on('connection', (ws) => {
  console.log('Client connected');

  let currentSessionId = null;
  let SessionTimeout = null;

  //計時
  function ResetSessionTimeout() {
    if (SessionTimeout) {
      clearTimeout(SessionTimeout)
    }
    SessionTimeout = setTimeout(() => {
      console.log('過期一分鐘');
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'sessionExpired',
            message: '舊的id已過期'
          }))
        }
      })
      sessionId = null;
    }, 5 * 60 * 1000)
  }

  ws.on('message', (message) => {
    try {
      try {
        data = JSON.parse(message);
      } catch (error) {
        data = message.toString();  // 解析失敗，當作純文字處理
      }
      console.log('收到訊息:', data);

      // 判斷是否為 session 相關的指令
      if (data.type === 'createNewSessionID') {
        console.log("create ID");
        const newSessionId = uuidv4();  // 生成新 UUID
        currentSessionId = newSessionId;

        // 廣播給舊使用者，讓他們的 ID 失效
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'sessionExpired',
              message: '舊的 ID 已失效'
            }));
          }
        });

        console.log('New Session ID:', currentSessionId);
        ws.send(JSON.stringify({ type: 'sessionUpdate', sessionId: currentSessionId }));

        ResetSessionTimeout();
        return; // 結束處理
      }

      if (typeof data === 'number') {
        if (data != waterfallLevel) {
          console.log('收到數字:', data);
          waterfallLevel = data;
          console.log("更新", waterfallLevel);
          // **將收到的訊息轉發給 Unity**
          if (unityClient && unityClient.readyState === WebSocket.OPEN) {
            unityClient.send(waterfallLevel);
            console.log('已轉發給 Unity:', waterfallLevel);
          }
        }
        else {
          console.log("原本的num", waterfallLevel);
        }
      }
      else {
        console.log('收到非數字訊息，忽略:', data);
      }
      if (typeof data === 'string') {
        console.log('收到文字:', data);
        unity_Text=data;
        unityClient.send(unity_Text);
      } 
    }
    catch (error) {
        console.error('錯誤', error);
      }
    })

  ws.on('close', () => {
    console.log('Client disconnected');
    currentSessionId = null;
    SessionTimeout = null;
  });
})

//websocket ->unity
ws_unity.on('connection', (ws) => {
  console.log('unity connected');
  unityClient = ws;
  const heartbeat = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('發送 ping');
      ws.ping(); // 向客戶端發送 ping 訊息
    }
  }, heartbeatInterval);

  ws.on('message', (message) => {
    console.log('收到訊息: ' + message);
    if (message === 'pong') {
      ws.send('ping'); // 客戶端發送 ping，伺服器回應 pong
    }
  })

  ws.on('close', () => {
    console.log('unity disconnected');
  });
})
//test
const HA_URL = "https://jgbvvy4fejhkfodvo163d86ppqvfptpj.ui.nabu.casa/api/services/light/turn_on";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmZGZhYTM4MWIwMTg0NjEyYTcwMjY1ZjljYWU5YTY4YiIsImlhdCI6MTc0MjIzNTA3MiwiZXhwIjoyMDU3NTk1MDcyfQ.VrgCHHG1GEHyUfSEzjOCwuuFtI0SA-qFLHdGSY9gt1c";
app.post("/control-light", async (req, res) => {
  try {
      const response = await axios.post(
          HA_URL,
          req.body,
          {
              headers: {
                  "Authorization": `Bearer ${API_KEY}`,
                  "Content-Type": "application/json"
              }
          }
      );
      res.json(response.data);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
})

module.exports = app;
