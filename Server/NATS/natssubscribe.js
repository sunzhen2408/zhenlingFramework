var NATS = require('nats');
const ServerConfig = require('../ServerConfig');
var nats = NATS.connect({servers:ServerConfig.NATSCONFIG.SERVERIPS,json: true});
const cache = require("../tempdata/UECache");
function startSubscribeServer(ueList) {
    nats.subscribe('foo', function (msg) {
        console.log('Received a message: ' + msg.pm2p5CC);
        cache.add(ueList,"temperature", msg.temperature/10);
        cache.add(ueList,"humidity", msg.humidity);
        cache.add(ueList,"pm2p5CC", msg.pm2p5CC);
        cache.add(ueList,"pm10CC", msg.pm10CC);
        cache.add(ueList,"VOCH2S", msg.VOCH2S);
        cache.add(ueList,"CH20NH3", msg.CH20NH3);
    });
}

module.exports.startSubscribeServer = startSubscribeServer;
