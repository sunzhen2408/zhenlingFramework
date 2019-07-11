const ServerConfig = require('../ServerConfig');
var NATS = require('nats');
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});

const net = require('net');
const {handleMsg, initSender} = require('./SensorMsgHandler');
const {removeAerialFsm} = require('./SensorFsmFactory');
const {smokeSensorServerCfg} = ServerConfig;
const PORT = smokeSensorServerCfg.port;
const aerialServer = net.createServer();
const hashmap = require('hashmap');
const allClientList = [];
const clientMap = new hashmap.HashMap;//仅存放LTE设备对应的 client，<boardsn,client>
const {emit} = require('../NATS/NATSRouter');
/*启动接收Lte Client的Server*/
function startSmokeSensorServer() {

    console.log("TCP before start aerial");
    aerialServer.on('connection', function (client) {
        console.log("TCP after start aerial");
        client.name = '';
        client.setTimeout(40 * 1000000, function () {
            console.warn("设备client" + client.name + "断开连接");
            broadcast();
        });
        allClientList.push(client);
        client.on('data', function (data) {
            if (data != null) {
               var result = handleMsg(client, data);
               // 通过nats发布数据
               emit('foo',result);
            }
        });

        /*监听客户端终止*/
        client.on('end', function () {//如果某个客户端断开连接，node控制台就会打印出来
            broadcast();
            console.log("串口服务器" + client.name + 'quit');
        });
        /*记录错误*/
        client.on('error', function (e) {
            broadcast();
            console.log(e);
        });
        initSender(client);
    });

    aerialServer.listen(PORT);
    console.log('Smoke Sensor Server Server listening on ' + PORT);
}

function broadcast() {
    let cleanup = [];//断开了的客户端们
    for (let i = 0; i < allClientList.length; i++) {
        //检查socket的可写状态
        if (allClientList[i].connecting) {
        } else {
            /*socket不可写，则将其从列表中移除*/
            const {closeclock} = require("./SensorFsmFactory");
            closeclock();
            //移除LTE设备的client和状态机
            allClientList[i].destroy();
            cleanup.push(allClientList[i]);
        }
    }
    /*删除掉服务器的客户端数组中，已断开的客户端*/
    for (let i = 0; i < cleanup.length; i++) {
        if (cleanup[i].name.length !== 0) {
            clientMap.delete(cleanup[ i].name);
        }
        allClientList.splice(allClientList.indexOf(cleanup[i]), 1);
    }
}
module.exports.startSmokeSensorServer = startSmokeSensorServer;

