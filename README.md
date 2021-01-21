# Presence switch connected to Microsoft Graph

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins) 
[![homebridge-presence-switch-msgraph](https://badgen.net/npm/v/homebridge-presence-switch-msgraph)](https://www.npmjs.com/package/homebridge-presence-switch-msgraph)

More information for now can be found here: [https://www.eliostruyf.com/diy-building-busy-light-show-microsoft-teams-presence/](https://www.eliostruyf.com/diy-building-busy-light-show-microsoft-teams-presence/).

> **Info**: Since verions `1.3.0` the plugin added state switches. These switches can be used for `HomeKit` automation. You can still use the API approach as well. This now supports the `Do Not Disturb` mode as well.

## Custom activity

As of version `1.5.0` you are now able to add custom activity statuses to the plugin. This mean, that besides the availablity (`available`, `away`, `busy`, and `donotdisturb`) statuses, you can now add your own activities you want to track. 

Supported activities are: `Available`, `Away`, `BeRightBack`, `Busy`, `DoNotDisturb`, `InACall`, `InAConferenceCall`, `Inactive`, `InAMeeting`, `Offline`, `OffWork`, `OutOfOffice`, `PresenceUnknown`, `Presenting`, `UrgentInterruptionsOnly`.

If you want to add for instance a `InACall` activity status, you can do this by adding the activity status to the `statusColor` config object as follows:

```json
{
  ...,

  "statusColors": {
    ...,

    "InACall": {
      "red": 255,
      "green": 0,
      "blue": 0
    }
  }
}
```

> **Info**: each off these activities you add, will also get a corresponding switch. That way you can add do Homekit automation based on the state of these switches.

## Config

The `accessory` config could look like this:

```json
{
  "accessory": "presence-switch",
  "name": "Presence Indicator",
  "appId": "66204339-daf1-40fa-aa31-57342272edce",
  "interval": 1,
  "setColorApi": "http://127.0.0.1:5000/api/switch",
  "offApi": "http://127.0.0.1:5000/api/off",
  "onApi": "http://127.0.0.1:5000/api/on",
  "startTime": "8:30",
  "endTime": "18:00",
  "weekend": false,
  "statusColors": {
    "available": {
      "red": 0,
      "green": 144,
      "blue": 0
    },
    "away": {
      "red": 255,
      "green": 191,
      "blue": 0
    },
    "busy": {
      "red": 179,
      "green": 0,
      "blue": 0
    },
    "donotdisturb": {
      "red": 149,
      "green": 0,
      "blue": 0
    },
    "<activity>": {
      "red": 255,
      "green": 0,
      "blue": 0
    }
  },
  "lightType": "",
  "debug": true
}
```

Since version `1.3.0` the plugin contains 5 state switches:

- Offline
- Do not disturb
- Busy
- Away
- Available

These switches can be used in `HomeKit` automation. If you use these, you do not have to set `setColorApi`, `offApi`, and `onApi`. Config could look like this:

```json
{
  "accessory": "presence-switch",
  "name": "Presence Indicator",
  "appId": "66204339-daf1-40fa-aa31-57342272edce",
  "interval": 1,
  "startTime": "8:30",
  "endTime": "18:00",
  "weekend": false,
}
```