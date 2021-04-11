# Changelog

## [09/05/2021] 1.7.0

- [#18](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/18) - Added `tenantId` as an extra option to allow multi-tenant setups

## [02/04/2021] 1.6.1

- [#17](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/17) - Restart the authentication process on failure.

## [01/04/2021] 1.6.0

- [#11](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/11) - Easier activity configuration (implemented by [Ben Fysh](https://github.com/benfysh))

## [05/02/2021] 1.5.2

- [#14](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/14) - Fix issue with refresh token on error
## [29/01/2021] 1.5.1

- [#10](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/10) - Fix lowercase issue on activity
- [#12](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/12) - Improvement on the presist auth

## [25/01/2021] 1.5.0

- [#1](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/1) - Persist auth during reboot or when turning the switch on/off
- [#10](https://github.com/estruyf/homebridge-presence-switch-msgraph/issues/10) - Add activity as an option to be used for setting the state

## [11/01/2021] 1.4.1

- Fix for being able to lower the polling refresh under 1 minute

## [12/12/2020] 1.4.0

- Updated the `beta` API to `v1.0` API endpoint

## [01/11/2020] 1.3.0

- Added presence indicator switches for `HomeKit` automation: offline, away, busy, do not disturb, available
- The API config properties `setColorApi`, `offApi`, and `onApi` are now optional
- Added `DoNotDisturb` status color

## [1/10/2020] 1.2.3

- Fix for when MSGraph timeout

## [18/04/2020] 1.2.2

- Removed `hap-nodejs` reference in PresenceAccessory

## [14/04/2020] 1.2.1

- Remove the `hap-nodejs` dependency

## [14/04/2020] 1.2.0

- Moved the start-up for the device flow to when the button gets activated

## [9/04/2020] 1.1.0

- Config schema changed to support forms

## [7/04/2020] 1.0.4

- Added access token logging

## [6/04/2020] 1.0.3

- Added extra debug logging

## [6/04/2020] 1.0.2

- Fix for `authCtx` which is `undefined`

## [5/04/2020] 1.0.1

- Fix debug output

## [5/04/2020] 1.0.0

- Initial version