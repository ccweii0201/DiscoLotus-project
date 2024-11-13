var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { v4: uuidv4 } = require('uuid');  // 引入 uuid 模組
const port = 3000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  

app.use(express.static(path.join(__dirname, '../client')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 新增 /start-session 路由
let currentSessionId = null;  // 儲存當前會話ID
let currentSessionCreatedAt = null; //

// 每 5 秒檢查一次 currentSessionId 是否有變化
setInterval(() => {
  if (currentSessionId && currentSessionCreatedAt) {
    // 檢查當前 session 是否超過 30 秒
    if (Date.now() - currentSessionCreatedAt > 30000) {
      // 清空 currentSessionId 和 currentSessionCreatedAt
      currentSessionId = null;
      currentSessionCreatedAt = null;
      console.log('id已過期');
    }
  }
}, 10000);

app.post('/start-session', (req, res) => {
  const newSessionId = uuidv4();  // 生成一個新的 UUID
  currentSessionId = newSessionId;  // 設定為當前會話ID
  console.log(currentSessionId);
  currentSessionCreatedAt = Date.now();
  // 將新的會話ID返回給前端
  res.json({ sessionId: newSessionId });
});
//驗證ID
app.post('/validate-session', (req, res) => {
  console.log(req.body);  // 從前端傳遞的id
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).send('Session ID is required');
  } //沒有id 回傳錯誤
  if (sessionId === currentSessionId) {
    res.send('Session is valid');
  } else {
    res.status(401).send('Session is invalid'+currentSessionId);
  }
});

//test
app.post('/test', (req, res) => {
  console.log('success');
  res.send('success');
});

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


module.exports = app;
