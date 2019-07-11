const {NATSClient} = require('../SmokeSensorClient/NATSClient');
const {NATSCONFIG} = require('../ServerConfig');
const mNats = new NATSClient(NATSCONFIG);
mNats.sayHello = () => {
    console.log('NATS Server For Video Server Started');
};

module.exports = {
    mNats: mNats,
    // nats 路由，定义emit方法，其中包括事件名和数据，内部调用nats的publish函数
    emit: (EventName, data) => {
        mNats.publish(EventName, data);
    },
};

