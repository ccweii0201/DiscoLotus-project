var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { v4: uuidv4 } = require('uuid');  // 引入 uuid 模組
const WebSocket = require('ws');
const http = require('http');
const port = process.env.PORT || 3000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = http.createServer(app);
const ws_unity = new WebSocket.Server({ port: 8080 })
const wss = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

let waterfallLevel = 4;
let unityClient = null;
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
      const data = JSON.parse(message);
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
        else{
          console.log("原本的num", waterfallLevel);
        }
      } else {
        console.log('收到非數字訊息，忽略:', data);
      }
    } catch (error) {
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
  ws.on('message', (message) => {
    console.log('收到訊息: ' + message);
  })

  ws.on('close', () => {
    console.log('unity disconnected');
  });
})

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

server.listen(3000, () => {
  console.log(`Server running at http://localhost:${port}`);
})

module.exports = app;
