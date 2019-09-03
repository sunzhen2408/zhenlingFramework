var http = require('http');

var server = http.createServer();
var qs = require('queryString');
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
        });
        res.write("success");
        res.end();
    }

});

server.listen(1001, function () {
    console.log('服务器启动，请访问http://localhost:1001');
});
