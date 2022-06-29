import chalk from 'chalk';
import ForzaJS from 'forza.js';
import nodeFetch from 'node-fetch';
import promptSync from 'prompt-sync';

const forza = new ForzaJS.default();
const prompt = promptSync({ sigint: true });

// TODO: swap to using Got instead of NodeFetch. it's much better
// @ts-ignore
const fetch = (...args) => nodeFetch.then(({ default: fetch }) => fetch(...args));

// Go to https://api.lovense.com/api/lan/getToys
// And Grab a few fields
const toyID = 'TOY_ID_HERE'; // Find the ToyId (random sort of Characters to Vibrate)
const platform = 'pc'; // What Device you are using. pc / android / ios
const domain = '192-168-178-16.lovense.club'; // Domain from Lovense
const port = '30010'; // httpsPort

const acceptedValues = ['rpm', 'rumble-average', 'speed', 'power', 'torque', 'brake', 'accel'];

// NOTE: These are used in functions and whoile loops lower down. Instantiating here to avoid squigglies
let vibrationFrom = null;
let maxVibration = null; // Max Power of 1-20 (Use 20 if ya wanna go wild)
let lastVibration = 0;

/**
 * Takes an Object and makes it URL safe ( `a=1&c=2` etc)
 * @param {object} myData Any ob3jct basically
 * @returns {string} URL safe version of the properties in the object
 */
function getProp(myData) {
  const out = [];
  for (const key in myData)
    if (Object.hasOwnProperty.call(myData, key))
      out.push(key + '=' + encodeURIComponent(myData[key]));

  return out.join('&');
}

/**
 * @description Construct new domain from given inputs
 * @param {string} endpoint
 * @param {object} [values]
 * @returns {string} The New Domain
 */
function lovenseUrl(endpoint, values) {
  if (endpoint.indexOf('A') === 0 && platform == 'pc') endpoint = endpoint.substring(1); // Removes the A for PC specific.

  let newDomain =
    `https://${domain}:${port}/${endpoint}` +
    (Object.keys(values).length > 0 ? `?${getProp(values)}` : '');

  // console.log(newDomain);
  return newDomain;
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

/**
 * @description Send Vibration value to Lovense Toy
 * @param {number} vibration from `0-1` representring percentage, i.e `0.5 === 50%`
 * @returns {void}
 */
const sendVibration = function (vibration) {
  if (vibration !== lastVibration) {
    lastVibration = vibration;
    const power = vibration || 0;
    const params = { sec: 0, v: power };
    // @ts-ignore
    if (toyID !== 'ALL') params.t = toyID;

    console.log('Sending Vibration', vibration);
    // eslint-disable-next-line no-unused-vars
    fetch(lovenseUrl('AVibrate', params)).then(async (res) =>
      console.log('Successfully sent vibration', vibration)
    );
  }
};

/**
 * @description Process the data coming from the game
 * @param {object} data
 * @returns {void}
 */
const processData = function (data) {
  /**
   * Vibration Percentage expressed as number between `0-1`
   * @type {number}
   * @example
   * var vibration = 0.5; // 50%
   */
  let vibration = 0;
  let vibrationInt = 0;
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
  }
  sendVibration(vibrationInt);
};

/**
 * @return {Promise<void>}
 */
(async function () {
  console.log('Options:');
  console.log(
    chalk.blue.bold('rpm            ') +
      '- RPM from the Engine ' +
      chalk.bold('(Best all around experience)')
  );
  console.log(
    chalk.blue.bold('rumble-average ') +
      '- Surface Rumble on Wheels ' +
      chalk.italic('(Averaged out)')
  );
  console.log(chalk.blue.bold('speed          ') + '- Speed, slow but fun');
  console.log(
    chalk.blue.bold('power          ') + '- Not quite sure, seems to be a similar thing to rpm.'
  );
  console.log(chalk.blue.bold('torque         ') + '- Torque of the Vehicle');
  console.log(
    chalk.blue.bold('brake          ') + '- How hard are you pushing down on the Brake Pedal'
  );
  console.log(
    chalk.blue.bold('accel          ') + '- How hard are you pushing down on the Accel Pedal'
  );

while (vibrationFrom === null) {
  console.log(chalk.bold('Select an option for Toys to React to?'));
  vibrationFrom = prompt(chalk.green('> '));

  if (!vibrationFrom || acceptedValues.indexOf(vibrationFrom) === -1) {
    vibrationFrom = null;
    console.warn(chalk.yellow('Invalid Value selected, please select a value from the list above'));
  }
}

while (maxVibration === null) {
  console.log(chalk.bold('What is the Max Vibration you would like to have? (1 to 20)'));
  let stringMax = prompt(chalk.green('> '));
  maxVibration = Number(stringMax);

  if (isNaN(maxVibration) || maxVibration < 1) {
    maxVibration = null;
    console.warn(chalk.yellow('Please provide a Number between 1 & 20'));
  } else if (maxVibration > 20) {
    maxVibration = 20;
    console.warn(chalk.grey('Number exceeds 20, Setting value to 20'));
  }
}

  await forza.loadGames();
  forza.startAllGameSockets();
  forza.on('telemetry', throttle(processData, 100));
})();
