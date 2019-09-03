var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const {initGroups} = require('./Server/GroupMannager');
const {startSmokeSensorServer} = require('./Server/SmokeSensorClient/TCPConn');
const {runServer} = require('./Server/webthing/frameWorksServer');
// const {startClient} = require('./Server/webthing/client');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// var getipRouter = require('./routes/getip')
var http = require('http');
// nats
const ServerConfig = require('./Server/ServerConfig');
var NATS = require('nats');
// 建立nats client
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
const {emit} = require('./Server/NATS/NATSRouter');


var server = http.createServer();
var qs = require('queryString');
var app = express();
//https://www.jianshu.com/p/5d945f94f47c
// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icon', express.static('public/static/icon'));
//  解析post请求
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}));


app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/applyIp',indexRouter);
////////////////
app.use(function (req, res, next) {
  let accessOriginArray = new Array(10);
  accessOriginArray = [
    "http://localhost:8000",
    "http://localhost:8001",
    "http://15.200.19.110:8000",
    "http://121.43.151.237:8000",
    "http://localhost:3000",
    "http://15.200.19.110:3000",
    "http://121.43.151.237:3000"];
  let origin = req.headers.origin;
  if (accessOriginArray.indexOf(origin) !== -1) {
    // console.log(accessOriginArray.indexOf(origin));
    // console.log(origin);
    // console.log(res.getHeader("Access-Control-Allow-Origin"));
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    accessOriginArray.push(origin);
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", 'true');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
  res.header("X-Powered-By", ' 3.2.1');
  // res.header("Content-Encoding", 'gzip, deflate');
  // res.header("Content-Language", 'zh-CN,zh;q=0.9');
  // res.header("Content-Type", "text/plain");

  /**
   * 跨域复杂请求时会先发送一个'OPTIONS'请求探路，当服务端回复200之后，前端才会发送正常的复杂请求
   */
  if (req.method === 'OPTIONS') {
    res.status(200);
    res.end();
  } else {
    next();
  }
});

//////////////

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

// response for ziqi
server.on('request',function (req, res) {
  //
  // console.log(req.url);
  // console.log("收到客户端的请求");
  // //设置响应报文头部,解决中文乱码
  // res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  // res.write('hello client，中文字体');
  // res.end();
  if(req.url.startsWith("/postTest")) {
    console.log("收到post请求");
    //暂存请求体信息
    var body = "";
    //请求链接
    console.log(req.url);
    //每当接收到请求体数据，累加到post中
    req.on('data', function (chunk) {
      body += chunk;  //一定要使用+=，如果body=chunk，因为请求favicon.ico，body会等于{}
      console.log("chunk:",chunk);
    });
    //在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    req.on('end', function () {
      // 解析参数
      body = qs.parse(body);  //将一个字符串反序列化为一个对象
      console.log("body:",body);
      console.log(body.id);
      console.log(body.event);
      for (index_id in body.id) {
         console.log(body.id[index_id])
        // emit(body.id[index_id].toString(), body.event);
        emit('1', body.event);
      }
      // emit('1', "kkk");
    });
    res.write("success");
    res.end();
  }

});

server.listen(1001, function () {
  console.log('启动http server');
});

// response for ziqi

setTimeout(() => {
  //函数路口
  runServer();
}, 6* 1000);
console.log("yes");
module.exports = app;
