const net = require('net');
const ServerConfig = require('../ServerConfig');
const {touchServerCfg} = ServerConfig;
const PORT = touchServerCfg.port;
const aerialServer = net.createServer();
const hashmap = require('hashmap');
const allClientList = [];
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
// nats
var NATS = require('nats');
//建立nats client
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
// 建立socket和继电器通信，控制其开关
function startTouchSensorServer() {

    console.log("TCP before start aerial");
    aerialServer.on('connection', function (client) {
        console.log("TCP after start aerial");

        // nats 订阅 报警器
        nats.subscribe('alarmflag',function (msg) {
             console.log('Received a message: ' + msg);
            if(msg==true){
                let f = 'AT+STACH2=1'+'\n';
                // socket 发送数据
                client.write(f);
            }else if(msg==false) {
                let f = 'AT+STACH2=0' + '\n';
                client.write(f);

            }

        });


        // 全局控制  传回id就触发报警机制  对应groupid
        nats.subscribe('1',function(msg){
            console.log("emit")
            if(msg==1) {
                let f = 'AT+STACH2=1' + '\n';
                // socket 发送数据
                console.log("响铃")
                client.write(f);
            }else{
                let f = 'AT+STACH2=0' + '\n';
                // socket 发送数据
                client.write(f);
                console.log("不响铃")
            }
        })

        //现在是实时获取，如何定时的获取？？？
        //每隔10ms就发送一次查询命令
        let f2 = 'AT+OCMOD=1,1'+'\n'
        client.write(f2);

        // client
        // if()
        client.setTimeout(40 * 1000000, function () {
            console.warn("设备client" + client.name + "断开连接");
            broadcast();
        });
        allClientList.push(client);
        // 接受到数据
        client.on('data',function(data){
              // console.log( "sss"+data);
            // if(data=)
            // 解析数据成字符串
            const str = decoder.write(data)
            // indexOf 判断字符串里是否有某个字符串    if(string.indexOf('stringB') >= 0){}
            // 如果信号是1，0  表示有信号输入， 那么会执行关闭命令
            if(str.indexOf('+OCCH_ALL:1,0')>=0){
                console.log("successful")
                //执行发送数据，将数据给继电器去完成相应的关闭操作
                let f = 'AT+STACH2=0' + '\n';
                client.write(f);
            }
            // if(str.indexOf('+OCCH_ALL:0,0')>=0){
            //     console.log("error")
            //     let f = 'AT+STACH2=0' + '\n';
            //     client.write(f);
            // }
            // if(str=="+OCCH_ALL:1,0"){
            //     console.log("successful")
            // //  2b 4f 43 43 48 5f 41 4c 4c 3a 31 2c 30 0d 0a    1
            // //    2b 4f 43 43 48 5f 41 4c 4c 3a 30 2c 30 0d 0a   0
            // }
// console.log(str)
            // if(data=="<Buffer 2b 4f 43 43 48 5f 41 4c 4c 3a 30 2c 30 0d 0a>"){
            //     console.log("successful")
            //     //  2b 4f 43 43 48 5f 41 4c 4c 3a 31 2c 30 0d 0a    1
            //     //    2b 4f 43 43 48 5f 41 4c 4c 3a 30 2c 30 0d 0a   0
            // }

        });
        /*监听客户端终止*/
        client.on('end', function () {//如果某个客户端断开连接，node控制台就会打印出来
            broadcast();
            console.log("串口服务器" + client.name + 'quit');
        });
        /*记录错误*/
        client.on('error', function (e) {
            console.log(e);
        });

    });

    aerialServer.listen(PORT);
    console.log('Touch Sensor  Server listening on ' + PORT);
}
// startTouchSensorServer();
module.exports.startTouchSensorServer = startTouchSensorServer;

// 当前策略，能够拿到一次的数据
//


//每隔10ms就发送一次查询命令
// 接受到数据
// 解析数据成字符串
// 如果信号是1，0  表示有信号输入， 那么会执行关闭命令
//执行关闭命令，给继电器发送相关指令

//  根据信号，发送命令。不按的时候，信号为0  命令为1； 按的时候信号为1，命令为0



//报警传感器的n中控制方式

// 1）网页端开关控制  ： 逻辑是返回值+ 回调函数
// 2）硬件开关控制    ： 逻辑是发送相应关闭指令
// 3）前端group开关控制  ： 逻辑是 router的方式    //nats的key 事件
// 4）pm2.5 超标控制   ： 逻辑是rule规则

//以上功能核心是 两种 其一 为 发送直接关闭指令
//  其二为，根据开关指令，再发送关闭指令
