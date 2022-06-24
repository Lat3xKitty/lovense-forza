# Lovense Forza #

An Unofficial integration with Forza to Vibrate toys as you play using the In-build Telemetry / Data Out feature. Vibrate while you drive. 😎

*Please note, that this should be used for Single player enjoyment or Multiplayer with Consenting participants. This mod shouldn't be used with Unsuspecting players in Multiplayer games*

## Setup ##

Inside of Forza you are required to setup a few different settings to spit out the required Telemetry Data for us to know all the stats. *This is a the guide provided for usage for [Forza.js](https://github.com/MatthewCash/forza.js#usage)*

**Enable "Data Out" in Forza Settings**
- This is usually near the bottom of `HUD AND GAMEPLAY`
- Set IP address to `127.0.0.1` and port to

| Game               | Port |
| ------------------ | ---- |
| Forza Motorsport 7 | 9917 |
| Forza Horizon 4    | 9924 |
| Forza Horizon 5    | 9925 |

### Network Isolation ###
Steam/Linux players will not have to do this but for Xbox / Windows store owners, Windows Apps prevent localhost connections by default for "security" This will need to be disabled for this program to work

Thankfully it can be done on a per-app basis by running the corresponding powershell command for your game:
#### Forza Motorsport 7: ####

```
CheckNetIsolation.exe LoopbackExempt -a -n="microsoft.apollobasegame_1.174.4791.2_x64__8wekyb3d8bbwe"
```

#### Forza Horizon 4: ####

```
CheckNetIsolation.exe LoopbackExempt -a -n="microsoft.sunrisebasegame_8wekyb3d8bbwe"
```

#### Forza Horizon 5: ####

```
CheckNetIsolation.exe LoopbackExempt -a -n="microsoft.624F8B84B80_8wekyb3d8bbwe"
```


## Starting the app: ##

`npm start`

Triggers the start function in `package.json` which simply runs node on `index.js`

## Telemetry to choose from ##

Telemetry to pick between:

* `rpm`            _- RPM from the Engine **(Best all around experience)**_
* `speed`          _- Current Speed, slow but fun_
* `rumble-average` _- Surface Rumble **(Average)**_
* `power`          _- Not quite sure, seems to be a similar thing to RPM._
* `torque`         _- Torque of the Vehicle_
* `accel`          _- How hard are you pushing down on the **Accelerate** Pedal_
* `brake`          _- How hard are you pushing down on the **Brake** Pedal_

## Where to get toy Data ##

Enable Lovense and connect it to a device `pc, android, ios` then visit the API pagethat is now available on your lan that will return a `json` document by clicking [api/lan/getToys](https://api.lovense.com/api/lan/getToys)

You are looking for the

* **platform** - _pc, android, ios_
* **domain** - _The domain Lovense is on_ e.g `192-168-178-16.lovense.club`
* **port** - _Will proably be `30010`_
* **toyID** - _this can be found in the `toys` section, `"status": 1` means the currently active toy (_if one is connected_) if you have two or more (_including generations_) of the same device, the are likely to show up with the same name (_e.g Domi and Domi 2 both listed as domi_) but have different `hVersions`. If you've given them nicknames that's even easier_
