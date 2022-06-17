const Forza = require('forza.js');
const nodeFetch = import('node-fetch');
const forza = new Forza.default();

const fetch = (...args) => nodeFetch.then(({ default: fetch }) => fetch(...args));

// Go to https://api.lovense.com/api/lan/getToys
// And Grab a few fields
const toyID = 'F96B83E9AFF8'; // Find the ToyId (random sort of Characters to Vibrate)
const platform = 'pc'; // What Device you are using. PC / Android / iOS
const domain = '192-168-178-16.lovense.club'; // Domain from Lovense
const port = '30010'; // httpsPort

// Select what it will react to
// rpm            - RPM from the Engine (Best all around experience)
// rumble-average - Surface Rumble (Average)
// speed          - Speed, slow but fun
// power          - Not quite sure, seems to be a similar thing to rpm.
// torque         - Torque of the Vehicle
// brake          - How hard are you pushing down on the Brake Pedal
// accel          - How hard are you pushing down on the Accel Pedal
const vibrationFrom = 'rpm';
const maxVibration = 15; // Max Power of 1-20 (Use 20 if ya wanna go wild)

function getProp(myData) {
  const out = [];
  for (const key in myData)
    if (myData.hasOwnProperty(key)) out.push(key + '=' + encodeURIComponent(myData[key]));
  return out.join('&');
}

function lovenseUrl(endpoint, values) {
  if (endpoint.indexOf('A') === 0 && platform == 'pc') endpoint = endpoint.substring(1); // Removes the A for PC specific.

  console.log(
    `https://${domain}:${port}/${endpoint}` +
      (Object.keys(values).length > 0 ? `?${getProp(values)}` : '')
  );

  return (
    `https://${domain}:${port}/${endpoint}` +
    (Object.keys(values).length > 0 ? `?${getProp(values)}` : '')
  );
}

// Throttling Function
const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

let lastVibration = 0;
const sendVibration = function (vibration) {
  if (vibration !== lastVibration) {
    lastVibration = vibration;
    const power = vibration || 0;
    const params = { sec: 0, v: power };
    if (toyID !== 'ALL') params.t = toyID;
    console.log('Sending Vibration', vibration);
    fetch(lovenseUrl('AVibrate', params)).then(async (res) =>
      console.log('Successfully sent vibration', vibration)
    );
  }
};

(async function () {
  await forza.loadGames();
  forza.startAllGameSockets();

  const processData = function (data) {
    // Do something with data

    /**
     * Vibration Percentage expressed as number between `0-1`
     * @type {number}
     * @example
     * var vibration = 0.5; // 50%
     */
    let vibration = 0.1;
    if (data.isRaceOn !== 0) {
      switch (vibrationFrom) {
        case 'rpm':
          vibration =
            (data.currentEngineRpm - data.engineIdleRpm) / (data.engineMaxRpm - data.engineIdleRpm);
          break;
        case 'rumble-average':
          vibration =
            ((data.surfaceRumbleFrontLeft +
              data.surfaceRumbleFrontRight +
              data.surfaceRumbleRearLeft +
              data.surfaceRumbleRearRight) /
              4) *
            1.666;
          // Seems to max at 6, so we're scaling it up to 10.
          break;
        case 'speed':
          vibration = data.speed / 100;
          break;
        case 'power':
          vibration = Math.abs(data.power) / 1000000;
          break;
        case 'torque':
          vibration = Math.abs(data.torque) / 1000;
          break;
        case 'brake':
          vibration = data.brake / 255;
          break;
        case 'accel':
          vibration = data.accel / 255;
          break;
      }

      let vibrationInt = Math.round(vibration * maxVibration);
      if (vibrationInt > maxVibration) vibrationInt = maxVibration;
      sendVibration(vibrationInt);
      forza.on('telemetry', throttle(processData, 100));
    }
  };
})();
