# Presence switch connected to Microsoft Graph

*To be added*

## Local development

```
nvm use v12
cd ~/.nvm/versions/node/v12.15.0/bin/

homebridge -D -I -U ~/nodejs/homebridge/homebridge-presence-switch-msgraph/debug -P ~/nodejs/homebridge/homebridge-presence-switch-msgraph
```

## Config

- AppId
- API URL to call
- Light states
  - Available
  - Away
  - Bussy
- Light settings
  - type: none, blink, ...
  - brightness: 0.4 - 1

## Useful links

- [https://github.com/oznu/homebridge-config-ui-x/wiki/Developers:-Plugin-Settings-GUI](https://github.com/oznu/homebridge-config-ui-x/wiki/Developers:-Plugin-Settings-GUI)