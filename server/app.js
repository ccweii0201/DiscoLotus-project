var createError = require('http-errors');
var express = require('express');
const cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { v4: uuidv4 } = require('uuid');  // 引入 uuid 模組
const WebSocket =require('ws');
const http = require('http'); 
const port = 3000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server=http.createServer(app);
const ws_unity =new WebSocket.Server({port:8080})
const wss=new WebSocket.Server({server});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function(req, res) {
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

//websocket ->web
wss.on('connection',(ws)=>{
  console.log('Client connected');

  let currentSessionId = null;  
  let SessionTimeout = null; 
  
  //計時
  function ResetSessionTimeout(){
    if (SessionTimeout){
      clearTimeout(SessionTimeout)
    } 
    SessionTimeout=setTimeout(()=>{
      console.log('過期一分鐘');
      wss.clients.forEach(client=>{
        if(client.readyState === WebSocket.OPEN){
          client.send(JSON.stringify({
            type:'sessionExpired',
            message:'舊的id已過期'
          }))
        }
      })
      sessionId=null;
    },5 * 60 * 1000)
  }

  ws.on('message',(message)=>{
    try{
      const data=JSON.parse(message);

      if(data.type==='createNewSessionID'){
        console.log("create ID")
        const newSessionId = uuidv4();  // 生成一個新的 UUID
        currentSessionId = newSessionId;  // 設定為當前會話ID
        
        //廣播給舊使用者，他id無法使用
        wss.clients.forEach(client=>{
          if(client !== ws && client.readyState === WebSocket.OPEN){
            client.send(JSON.stringify({
              type:'sessionExpired',
              message:'舊的id已失效'
            }))
          }
        })

        console.log('New Session ID:'+currentSessionId);
        ws.send(JSON.stringify({type:'sessionUpdate',sessionId:currentSessionId}));

        ResetSessionTimeout();
      }
    }
    catch(error){
      console.error('錯誤',error);
    }

  })

  ws.on('close', () => {
    console.log('Client disconnected');
    currentSessionId = null; 
    SessionTimeout = null; 
  });
})

//websocket ->unity
ws_unity.on('connection',(ws)=>{
  console.log('unity connected');

  ws.on('message',(message)=>{
    console.log('收到訊息: ' + message);
  })

  ws.on('close', () => {
    console.log('unity disconnected');
  });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

server.listen(3000,()=>{
  console.log(`Server running at http://localhost:${port}`);
})

module.exports = app;
