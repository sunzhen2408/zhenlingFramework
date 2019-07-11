const {NATSClient} = require('../SmokeSensorClient/NATSClient');
const {NATSCONFIG} = require('../ServerConfig');
const mNats = new NATSClient(NATSCONFIG);
mNats.sayHello = () => {
    console.log('NATS Server For Video Server Started');
};

module.exports = {
    mNats: mNats,
    emit: (EventName, data) => {
        mNats.publish(EventName, data);
    },
};

