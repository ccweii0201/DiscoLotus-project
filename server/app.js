var createError = require('http-errors');
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
const { exec } = require("child_process");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = http.createServer(app);
const ws_esp32 = new WebSocket.Server({ noServer: true });
const ws_unity = new WebSocket.Server({ noServer: true });
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/unity') {
    ws_unity.handleUpgrade(request, socket, head, (ws) => {
      ws_unity.emit('connection', ws, request);
    });
  } else if (request.url === '/esp32') {
    ws_esp32.handleUpgrade(request, socket, head, (ws) => {
      ws_esp32.emit('connection', ws, request);
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
let esp32Client = null;
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
    },5* 60 * 1000)
  }

  // 設定心跳機制
  ws.isAlive = true;  // 標記此連線為活躍的
  ws.on('pong', () => {
    ws.isAlive = true; // 收到 pong 訊號時標記為存活
  });

  // 設定心跳檢查間隔（每 10 秒執行一次）
  const heartbeatInterval = setInterval(() => {
    if (ws.isAlive === false) {
      console.log('客戶端未回應，關閉連線');
      return ws.terminate();
    }
    ws.isAlive = false; // 每次檢查時先標記為 false，等收到 pong 再標記為 true
    ws.ping(); // 發送 ping 訊號
  }, 10000);

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
              type: 'sessionUsed',
              message: '舊的 ID 已失效'
            }));
          }
        });

        console.log('New Session ID:', currentSessionId);
        ws.send(JSON.stringify({ type: 'sessionUpdate', sessionId: currentSessionId }));

        ResetSessionTimeout();
        return; // 結束處理
      }
      //unity的字
      if (data.type === 'bgText_345') {
        console.log('收到 bgText_345 文字');
        let displayText = 'third forth fifth'; // 設置對應的文字
        if (unityClient && unityClient.readyState === WebSocket.OPEN) {
          unityClient.send(bgText_345);
          console.log('已轉發文字給 Unity:', bgText_345);
        }
      }
      //瀑布+平安喜樂
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
        unity_Text = data;

        if (data === "open" || data === "close") {
          if (esp32Client && esp32Client.readyState === WebSocket.OPEN) {
            esp32Client.send(data);
            console.log("📤 指令已轉發給 ESP32:", data);
          } else {
            console.log("❌ ESP32 未連線，無法傳送指令");
          }
        }
        if (data === "right" || data === "left") {
          if (esp32Client && esp32Client.readyState === WebSocket.OPEN) {
            esp32Client.send(data);
            console.log("📤 指令已轉發給 ESP32:", data);
          } else {
            console.log("❌ ESP32 未連線，無法傳送指令");
          }
        }
        if (data === "playBG") {
          console.log("🎵 播放音樂...");
          exec('start "" "C:\\Users\\ccwkt\\Project\\DiscoLotus project\\client\\audio\\test.mp3"', (error) => {
              if (error) console.error(`❌ 播放失敗: ${error.message}`);
          });
        
      }
      if (data === "djOn") {
        console.log("🎵 播放音樂...");
        exec('start "" "C:\\Users\\ccwkt\\Project\\DiscoLotus project\\client\\audio\\dj-on.mp3"', (error) => {
            if (error) console.error(`❌ 播放失敗: ${error.message}`);
        });

        unityClient.send(unity_Text);
      }

      }}
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

// WebSocket -> ESP32
ws_esp32.on('connection', (ws) => {
  console.log('ESP32 connected');
  esp32Client = ws;

  ws.on('message', (message) => {
    console.log('收到來自 ESP32 的訊息: ' + message);
  });

  ws.on('close', () => {
    console.log('ESP32 disconnected');
    esp32Client = null;
  });
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
