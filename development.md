# Local development

Install the following dependencies: `npm install -g homebridge homebridge-config-ui-x`.

Run the following commands:

```
nvm use v12
cd ~/.nvm/versions/node/v12.20.0/bin/
homebridge -D -I -U ~/nodejs/homebridge-presence-switch-msgraph/debug -P ~/nodejs/homebridge-presence-switch-msgraph
```

Sample `config.json` file to put in the `debug` folder:

```json
{
  "bridge": {
    "name": "Homebridge",
    "username": "0E:4E:28:1A:17:F8",
    "pin": "031-45-154"
  },
  "accessories": [{
    "name": "Presence Indicator",
    "appId": "66204339-daf1-40fa-aa31-57342272edce",
    "interval": 1,
    "setColorApi": "http://192.168.1.90:5000/api/switch",
    "offApi": "http://192.168.1.90:5000/api/off",
    "onApi": "http://192.168.1.90:5000/api/on",
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
      "InACall": {
        "red": 255,
        "green": 0,
        "blue": 0
      }
    },
    "debug": true,
    "accessory": "presence-switch"
  }],
  "platforms": [
    {
      "name": "Config",
      "port": 8888,
      "auth": "form",
      "theme": "auto",
      "tempUnits": "c",
      "lang": "auto",
      "platform": "config"
    }
  ]
}
```

## Useful links

- [https://github.com/oznu/homebridge-config-ui-x/wiki/Developers:-Plugin-Settings-GUI](https://github.com/oznu/homebridge-config-ui-x/wiki/Developers:-Plugin-Settings-GUI)