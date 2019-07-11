[TOC]

# zhenlingFramework
## smokersensor
### 01 socket 通信

```
// TCPConn 为程序入口
startSmokeSensorServer()
```

``` 
// 接收到数据传输，触发handleMsg处理数据
client.on('data', function (data) {
            if (data != null) {
               var result = handleMsg(client, data);
               // 触发nats 
               emit('foo',result);
            }
        });
```

``` 
// 接收到数据传输，触发handleMsg处理数据
client.on('data', function (data) {
            if (data != null) {
               var result = handleMsg(client, data);
               emit('foo',result);
            }
        });
```

``` 
// 处理数据并返回
 handleMsg: (client, data) => {
        try {
            let ackMsg = ackStruct.read(data.buffer);
            ackMsg = toBD(ackStruct, ackMsg);
            const {addressNum, temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3} = ackMsg;
            return {temperature, humidity, pm2p5CC, pm10CC,VOCH2S,CH20NH3};
        } catch (e) {
            console.log(e);
        }
    },
```

### 02 nats传输数据


``` 
// 接收到数据传输，触发handleMsg处理数据
client.on('data', function (data) {
            if (data != null) {
               var result = handleMsg(client, data);
// 触发nats 
               emit('foo',result);
            }
        });
```

```
// nats的 emit 路由
   mNats: mNats,
    emit: (EventName, data) => {
        mNats.publish(EventName, data);
    },

```

``` 
// nats 订阅烟雾传感器数据 ,调用cache.add方法，像map中添加数据
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

```

``` 
// 通过readFromGPIO(key) 获取烟雾传感器数据，并且定期调用传感器数据，通过websocket发送给gateway
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
   readFromGPIO(key) {
        let ueInfos = ueList.get(key);
        if (ueInfos != undefined) {
            var len = ueInfos.length;
            ueInfos = ueInfos.slice(len - 1, len);  //slice
            return ueInfos;
        }
        return 0;

    }

```

###  添加传感器

``` 
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
```

## alarmsensor
alarmsensor 利用off-on，数据流和烟雾传感器相反，是从gateway到thing的

### 03 添加传感器
``` 
// 注意new Value，此处涉及回调函数，前端开关信息往后端传输，并回调函数中的通过nats传输
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
```

### 02 nats传输数据
``` 
// 在后台和继电器之间建立socket连接，并且订阅nats中关于开关的数据
// 当03 中回调函数发布开关信息，此处就能收到，并且自动执行nats中alarmflag事件绑定的操作

function startAlarmSensorServer() {

    console.log("TCP before start aerial");
    aerialServer.on('connection', function (client) {
        console.log("TCP after start aerial");
        // nats 订阅
        nats.subscribe('alarmflag',function (msg) {
            console.log('Received a message: ' + msg);
            if(msg==true){
                let f = 'AT+STACH2=1'+'\n';
                client.write(f);
            }else if(msg==false) {
                let f = 'AT+STACH2=0' + '\n';
                client.write(f);

            }

```

### 01 socket 通信

``` 
        // nats 订阅
        nats.subscribe('alarmflag',function (msg) {
            console.log('Received a message: ' + msg);
            if(msg==true){
            // 开命令
                let f = 'AT+STACH2=1'+'\n';
//  此处通过socket通信，发送指令
                client.write(f);
            }else if(msg==false) {
            //关命令
                let f = 'AT+STACH2=0' + '\n';
//  此处通过socket通信，发送指令
                client.write(f);

            }

```

#### note 
02 01 其实是一处代码，外围建立与继电器的socket通信，当创建连接实例后，触发回调函数，函数中执行订阅事件，又因为nats的订阅类似于websocket，是属于长连接，只有一次建立，一直保持订阅状态，因此当gateway控制开关，new Value对应的回调函数发布开关信息，此处自动接收，并根据接收的信息，发送socket，触发或关闭警铃




