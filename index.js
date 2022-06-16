const Forza = require('forza.js');
const forza = new Forza.default();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Go to https://api.lovense.com/api/lan/getToys
// And Grab a few fields
var toy = 'TOY_ID';           // Find the ToyId (random sort of Characters to Vibrate) 
var platform = "android";     // What Device you are using. PC / Android / iOS
var domain = "192-168-1-98.lovense.club"; // Domain from Lovense
var port = "30010";           // httpsPort 

// Select what it will react to
// rpm            - RPM from the Engine        (Best all around experience)
// rumble-average - Surface Rumble (Average)
// speed          - Speed, slow but fun
// power          - Not quite sure, seems to be a similar thing to rpm.
// torque         - Torque of the Vehicle
// brake          - How hard are you pushing down on the Brake Pedal
// accel          - How hard are you pushing down on the Accel Pedal
var vibrationFrom = 'speed';
var maxVibration = 20;      // Max Power of 1-20 (Use 20 if ya wanna go wild)

(async function () {
    await forza.loadGames();
    forza.startAllGameSockets();

    var processData = function(data) {
      // Do something with data

      /**
       * 0-1 = 0% - 100%
       */
      var vibration = 0;
      if (data.isRaceOn === 0) {
      }
      else {
        switch (vibrationFrom) {
          case 'rpm':
            vibration = (data.currentEngineRpm - data.engineIdleRpm)
                        /
                        (data.engineMaxRpm - data.engineIdleRpm);
            break;

          case 'rumble-average':
            vibration = (
              ((
                data.surfaceRumbleFrontLeft + data.surfaceRumbleFrontRight +
                data.surfaceRumbleRearLeft + data.surfaceRumbleRearRight
              )
              / 4)
              * 1.666
              // Seems to max at 6, so we're scaling it up to 10.
            );
            break;

            // One wheel is always max?
          // case 'rumble-max':
          //   vibration = (
          //     Math.max(
          //       data.surfaceRumbleFrontLeft, data.surfaceRumbleFrontRight,
          //       data.surfaceRumbleRearLeft, data.surfaceRumbleRearRight
          //     )
          //     * 1.666
          //   );
          //   break;

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

        // console.log(vibrationFrom, vibration.toFixed(2));

        var vibrationInt = Math.round(vibration * maxVibration);
        if (vibrationInt > maxVibration) {
          vibrationInt = maxVibration;
        }
      }

      sendVibration(vibrationInt);
    }

    forza.on('telemetry', throttle(
      processData,
      100
    ));


})()

// Throttling Function
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

var lastVibration = 0;
const sendVibration = function(vibration) {
  if (vibration !== lastVibration) {
    lastVibration = vibration;

    var power = vibration;
    if (!power) { power = 0; }

    var params = {
      sec: 0,
      v: power
    }
    if (toy !== 'ALL') {
      params.t = toy;
    }
    console.log("Sending Vibration", vibration);
    fetch(lovenseUrl("AVibrate", params))
    .then(async res =>
      console.log("Successfully sent vibration", vibration)
    );
  }
}

function lovenseUrl(endpoint, values) {
  if (endpoint.indexOf("A") === 0 && platform == "pc") {
    endpoint = endpoint.substring(1); // Removes the A for PC specific.
  }

  console.log(
    `https://${domain}:${port}/${endpoint}` +
    (Object.keys(values).length > 0 ? `?${getProp(values)}` : "")
  );


  return (
    `https://${domain}:${port}/${endpoint}` +
    (Object.keys(values).length > 0 ? `?${getProp(values)}` : "")
  );

  function getProp(myData) {
    var out = [];
    for (var key in myData) {
      if (myData.hasOwnProperty(key)) {
        out.push(key + "=" + encodeURIComponent(myData[key]));
      }
    }
    return out.join("&");
  }
}
