import { PresenceAccessory } from './accessories';
import { Homebridge } from './models';
const packageJSON = require('../package.json');

const HOMEBRIDGE_PLATFORM_NAME = "presence-switch";

export default function (homebridge: Homebridge) {
  PresenceAccessory.register(homebridge, packageJSON, HOMEBRIDGE_PLATFORM_NAME);
};
