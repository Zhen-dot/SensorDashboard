require('dotenv').config();

const mqtt = require('mqtt');

const {
    MQTT_HOST = 'localhost',
    PUBLISH_FREQ = 1,
    TEMP_DEVICE_COUNT = 3,
    TEMP_MAX = 30,
    TEMP_MIN = 20,
    HUMID_MAX = 80,
    HUMID_MIN = 55,
} = process.env;

console.log(TEMP_DEVICE_COUNT);

const tempMin = Number(TEMP_MIN);
const tempMax = Number(TEMP_MAX);
const humidMax = Number(HUMID_MAX);
const humidMin = Number(HUMID_MIN);

const client = mqtt.connect(`mqtt://${MQTT_HOST}`);

const lastValues = {};
let publishTask;

const generateRandomValue = (min, max) => {
    return min + Math.random() * (max - min);
};

const publishData = () => {
    const timestamp = Date.now();
    for (let i = 1; i <= TEMP_DEVICE_COUNT; i += 1) {
        const deviceId = `dummy-temp-${i}`;
        let lastValue = lastValues[deviceId];
        if (!lastValue) {
            const temperature = generateRandomValue(tempMin, tempMax);
            const humidity = generateRandomValue(humidMin, humidMax);
            lastValue = {
                temperature,
                humidity,
            };
        } else {
            lastValue.temperature += generateRandomValue(-0.5, 0.5);
            lastValue.temperature = Math.max(tempMin, Math.min(tempMax, lastValue.temperature));
            lastValue.humidity += generateRandomValue(-5, 5);
            lastValue.humidity = Math.max(humidMin, Math.min(humidMax, lastValue.humidity));
        }
        client.publish(
            `site-a/data/${deviceId}/temp`,
            JSON.stringify({
                timestamp,
                deviceId,
                ...lastValue,
            }),
        );
        lastValues[deviceId] = lastValue;
    }
    console.log(`Published data @ ${timestamp}`);
};

client.on('connect', () => {
    console.log('MQTT Connected');
    publishTask = setInterval(publishData, PUBLISH_FREQ * 1000);
});

client.on('close', () => {
    console.log('MQTT disconnected');
    if (publishTask) clearInterval(publishTask);
});
