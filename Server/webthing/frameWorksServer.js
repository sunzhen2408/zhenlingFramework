const SensorMsgHandler = require('../SmokeSensorClient/SensorMsgHandler');
const SensorFsmFactory = require('../SmokeSensorClient/SensorFsmFactory');
const {startClient} = require('./client');
const ServerConfig = require('../ServerConfig');
var humidity = undefined;
var NATS = require('nats');
var nats = NATS.connect({servers: ServerConfig.NATSCONFIG.SERVERIPS, json: true});
const {startSmokeSensorServer} = require('../SmokeSensorClient/TCPConn');
const {startAlarmSensorServer} = require('../Alarm/Alarm')
const {startSubscribeServer} = require('../NATS/natssubscribe');
const ueList = new Map();
const {emit} = require('../NATS/NATSRouter');
const cache = require("../tempdata/UECache");
const {
    Action,
    Event,
    SingleThing,
    Property,
    Thing,
    Value,
    WebThingServer,
} = require('webthing');

class SmokeSensor extends Thing {


    constructor() {
        super('My Humidity Sensor',
            ['MultiLevelSensor'],
            'A web connected humidity sensor');
        this.pm2p5CC = new Value(0.0);
        this.temperature = new Value(0.0);
        this.humidity = new Value(0.0);
        this.pm2p5CC = new Value(0.0);
        this.pm10CC = new Value(0.0);
        this.VOCH2S = new Value(0.0);
        this.CH20NH3 = new Value(0.0);
        this.addProperty(
            new Property(
                this,
                'pm2p5CC',
                this.pm2p5CC,
                {
                    '@type': 'LevelProperty',
                    title: 'pm2p5CC',
                    type: 'number',
                    description: 'The current pm2p5CC in %',
                    minimum: -100,
                    //此处涉及到最大值 就是前端配置的最大值
                    maximum: 1000,
                    // unit: 'percent',
                    readOnly: true,
                }));
        this.addProperty(
            new Property(
                this,
                'temperature',
                this.temperature,

                {
                    '@type': 'LevelProperty',
                    title: 'Temperature',
                    type: 'number',
                    description: 'The current temperature in %',
                    minimum: -100,
                    maximum: 100,
                    // unit: 'percent',
                    readOnly: true,
                }));

// this.humidity = this.dataSturcture.get('humidity');
        this.addProperty(
            new Property(
                this,
                'humidity',
                this.humidity,
                {
                    '@type': 'LevelProperty',
                    title: 'Humidity',
                    type: 'number',
                    description: 'The current humidity in %',
                    minimum: -100,
                    maximum: 100,
                    unit: 'percent',
                    readOnly: true,
                }));

// this.pm10CC = this.dataSturcture.get('pm10CC');
        this.addProperty(
            new Property(
                this,
                'pm10CC',
                this.pm10CC,
                {
                    '@type': 'LevelProperty',
                    title: 'pm10CC',
                    type: 'number',
                    description: 'The current pm10CC in %',
                    minimum: -100,
                    maximum: 100,
                    // unit: 'percent',
                    readOnly: true,
                }));
// this.VOCH2S = this.dataSturcture.get('VOCH2S');
        this.addProperty(
            new Property(
                this,
                'VOCH2S',
                this.VOCH2S,
                {
                    '@type': 'LevelProperty',
                    title: 'VOCH2S',
                    type: 'number',
                    description: 'The current VOCH2S in %',
                    minimum: -100,
                    maximum: 100,
                    // unit: 'percent',
                    readOnly: true,
                }));

// this.CH20NH3 = this.dataSturcture.get('CH20NH3');
        this.addProperty(
            new Property(
                this,
                'CH20NH3',
                this.CH20NH3,
                {
                    '@type': 'LevelProperty',
                    title: 'CH20NH3',
                    type: 'number',
                    description: 'The current CH20NH3 in %',
                    minimum: -100,
                    maximum: 100,
                    // unit: 'percent',
                    readOnly: true,
                }));

// Poll the sensor reading every 3 seconds
        // Update the underlying value, which in turn notifies all listeners
        setInterval(() => {
            const data_temperature = this.readFromGPIO("temperature");
            const data_humidity = this.readFromGPIO("humidity");
            const data_pm2p5CC = this.readFromGPIO("pm2p5CC");
            const data_pm10CC = this.readFromGPIO("pm10CC");
            const data_VOCH2S = this.readFromGPIO("VOCH2S");
            const data_CH20NH3 = this.readFromGPIO("CH20NH3");
            this.temperature.notifyOfExternalUpdate(data_temperature);
            this.humidity.notifyOfExternalUpdate(data_humidity);
            this.pm2p5CC.notifyOfExternalUpdate(data_pm2p5CC);
            this.pm10CC.notifyOfExternalUpdate(data_pm10CC);
            this.VOCH2S.notifyOfExternalUpdate(data_VOCH2S);
            this.CH20NH3.notifyOfExternalUpdate(data_CH20NH3);
        }, 1000);
    }

    /**
     * Mimic an actual sensor updating its reading every couple seconds.
     */

    readFromGPIO(key) {
        let ueInfos = ueList.get(key);
        if (ueInfos != undefined) {
            var len = ueInfos.length;
            ueInfos = ueInfos.slice(len - 1, len);  //slice
            return ueInfos;
        }
        return 0;

    }


}

class AlarmSensor extends Thing {
    constructor() {
        super('My Alarm Sensor',
            ['Alarm'],
            'A web  alarm sensor');
        this.addProperty(
            new Property(
                this,
                'on',
                new Value(true, (v) => {
                    console.log(v)
                    emit('alarmflag', v);
                }),
                {
                    "@context": "https://iot.mozilla.org/schemas/",
                    '@type': 'OnOffProperty',
                    title: 'On/Off',
                    type: 'boolean',
                    description: '@context of "https://iot.mozilla.org/schemas"',
                }));
    }


}

function runServer() {
    const sensor = new SmokeSensor();
    const sensor2 = new AlarmSensor();
    startSmokeSensorServer();
    startSubscribeServer(ueList);
//在startSmokeSenSor之前启动
    const server = new WebThingServer(new SingleThing(sensor),
        8181);
    const server2 = new WebThingServer(new SingleThing(sensor2),
        8182);
    server.start().catch(console.error);
    server2.start().catch(console.error);
    startAlarmSensorServer()
}

module.exports.runServer = runServer;
