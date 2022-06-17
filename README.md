# lovense-forza #

Forza Telemetry to Control Lovense Toys

## Running and Stopping ##

`npm start`

Triggers that start function in `package.json` which simply runs node on `index.js`

`npm stop`

## Telemetry to choose from ##

Telemetry to pick between:

* `rpm`            _- RPM from the Engine **(Best all around experience)**_
* `speed`          _- Current Speed, slow but fun_
* `rumble-average` _- Surface Rumble **(Average)**_
* `power`          _- Not quite sure, seems to be a similar thing to RPM._
* `torque`         _- Torque of the Vehicle_
* `accel`          _- How hard are you pushing down on the **Accelerate** Pedal_
* `brake`          _- How hard are you pushing down on the **Brake** Pedal_

> Enter the required setting on `index.js` line **22** `var vibrationFrom = 'rpm';`

## Where to get toy Data ##

Enable Lovense and connect it to a device `pc, android, ios` then visit the API pagethat is now available on your lan that will return a `json` document by clicking [api/lan/getToys](https://api.lovense.com/api/lan/getToys)

You are looking for the

* **platform** - _pc, android, ios_
* **domain** - _The domain Lovense is on_ e.g `192-168-178-16.lovense.club`
* **port** - _Will proably be `30010`_
* **toyID** - _this can be found in the `toys` section, `"status": 1` means the currently active toy (_if one is connected_) if you have two or more (_including generations_) of the same device, the are likely to show up with the same name (_e.g Domi and Domi 2 both listed as domi_) but have different `hVersions`. If you've given them nicknames that's even easier_
