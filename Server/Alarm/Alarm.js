const net = require('net');
const ServerConfig = require('../ServerConfig');
const {alarmServerCfg} = ServerConfig;
const PORT = alarmServerCfg.port;
const aerialServer = net.createServer();
const hashmap = require('hashmap');
const allClientList = [];
var NATS = require('nats');
// 建立nats client
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
// 建立socket和继电器通信，控制其开关
function startAlarmSensorServer() {

    console.log("TCP before start aerial");
    aerialServer.on('connection', function (client) {
        console.log("TCP after start aerial");
        // nats 订阅
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
        client.setTimeout(40 * 1000000, function () {
            console.warn("设备client" + client.name + "断开连接");
            broadcast();
        });
        allClientList.push(client);
        client.on('data',function(data){
            console.log('recv data:'+ data);
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
    console.log('Alarm Sensor  Server listening on ' + PORT);
}

module.exports.startAlarmSensorServer = startAlarmSensorServer;

