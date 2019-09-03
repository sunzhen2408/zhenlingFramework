var express = require('express');
var router = express.Router();
const {execrm} = require("../changeIp/rm")
const {netplan} = require("../changeIp/test4")
// var bodyParser = require('body-parser')
// router.use(bodyParser.urlencoded({extended: false}));
// var app = express();
// nats
// var NATS = require('nats');
// //建立nats client
// var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
// var qs = require('queryString');

// const {emit} = require('../Server/NATS/NATSRouter');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   // const key = 111;
//   // console.log("dddd")
//
//   emit('111', "kkk");
//   res.send('respond with a resource');
//   // res.send('respond with a resource');
// });


router.get('/clear', function(req, res, next) {
   // var ip =
  console.log("clear successfully");
  // res.send('respond with a resource');
  // execrm();
  res.end();
});
router.get('/applyIp', function(req, res, next) {
  console.log(req.query.ip)
  console.log(req.query.gateway4)
  // console.log("sss")
  // netplan(req.query.ip,req.query.gateway4)
  res.end();
  // res.send('respond with a resource');
});
module.exports = router;
  // const key = 111;
  // console.log("dddd")
 // var query = req.body;
 // console.log(req.method)
 //
 //  // 必须是json请求
 //  console.log("body+",req.body.id)
 //  emit('1', "1");
 //  res.send('respond with a resource');
 //  // res.send('respond with a resource');
 // var body = "";
 // //请求链接
 // //console.log(req.url);
 // //每当接收到请求体数据，累加到post中
 //  req.on('data', function (chunk) {
 //  body += chunk;  //一定要使用+=，如果body=chunk，因为请求favicon.ico，body会等于{}
 //  console.log("chunk:",chunk);
 //
 //  });
 // req.on('end', function () {
 //  // 解析参数
 //  body = qs.parse(body);  //将一个字符串反序列化为一个对象
 //  console.log("body:",body);
 //  console.log(body.id);
 //  console.log(body.event);
 // });

// app.post('/',function(req,res){
//
// });
// app.listen(3000);



// var express = require('express');
// var router = express.Router();
//
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
//
// module.exports = router;





// 本方案厉害之处在于，巧妙的利用了进程之间的通信方式，来实现进程之间数据的传输
// 又想到go语言中 有一个通道的特性
// 把为什么要用消息队列理解一下





