/// <reference types="hap-nodejs" />

import { Homebridge, HomebridgeAccessory, PresenceConfig, Logger, Presence, Availability, StatusColors, RGB } from '../models';
import persist from 'node-persist';
import { Auth, splitHours } from '../helpers';
import { MsGraphService, BusyLightService } from '../services';
import { Activity } from '../models/Activity';

const MSGRAPH_URL = `https://graph.microsoft.com`;
const MSGRAPH_PRESENCE_PATH = `v1.0/me/presence`;

export class PresenceAccessory implements HomebridgeAccessory {
  private static api: Homebridge = null;
  private static service: HAPNodeJS.Service = null;
  private static characteristic: HAPNodeJS.Characteristic = null;
  private static version: string = null;

  private accessoryService: HAPNodeJS.Service = null;
  private storage: typeof persist;
  private auth: Auth = null;

  private switchOff: HAPNodeJS.Service = null;
  private switchAway: HAPNodeJS.Service = null;
  private switchBusy: HAPNodeJS.Service = null;
  private switchAvailable: HAPNodeJS.Service = null;
  private switchDnD: HAPNodeJS.Service = null;

  private activitySwitches: { [name: string]: HAPNodeJS.Service} = {};

  private timeoutIdx: NodeJS.Timeout = null;

  private readonly defaultColors: StatusColors = {
    available: {
      red: 0,
      green: 144,
      blue: 0
    },
    away: {
      red: 255,
      green: 191,
      blue: 0
    },
    busy: {
      red: 179,
      green: 0,
      blue: 0
    },
    donotdisturb: {
      red: 149,
      green: 0,
      blue: 0
    }
  };

  private config: PresenceConfig = {
    name: null,
    accessory: null,
    appId: null,
    tenantId: null,
    interval: 1, // Every minute
    setColorApi: null,
    offApi: null,
    onApi: null,
    startTime: null,
    endTime: null,
    lightType: null,
    statusColors: this.defaultColors,
    weekend: false,
    debug: false
  };

  /**
   * Initialize the accessory registration
   *
   * @param homebridge
   * @param packageJSON
   * @param platformName
   */
  public static register(homebridge: Homebridge, packageJSON: any, platformName: string) {
    console.log(`The ${packageJSON.name} plugin version is: ${packageJSON.version}. Installed on Homebridge version: ${homebridge.version}.`);

    this.api = homebridge;
    this.service = homebridge.hap.Service;
    this.characteristic = homebridge.hap.Characteristic;
    this.version = packageJSON.version;

    homebridge.registerAccessory(packageJSON.name, platformName, PresenceAccessory);
  }

  constructor(private log: Logger, options: PresenceConfig, private api: Homebridge) {
    // Overwrite the default config
    this.config = Object.assign({}, this.config, options);

    // Register new switch
    this.accessoryService = new PresenceAccessory.service.Switch(this.config.name, null);
    this.accessoryService.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false).on("set", this.setStatus);

    // Register state switches
    this.switchOff = new PresenceAccessory.service.Switch(`${this.config.name} - Offline`, 'Offline');
    this.switchOff.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);

    this.switchBusy = new PresenceAccessory.service.Switch(`${this.config.name} - Busy`, 'Busy');
    this.switchBusy.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);

    this.switchAway = new PresenceAccessory.service.Switch(`${this.config.name} - Away`, 'Away');
    this.switchAway.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);

    this.switchAvailable = new PresenceAccessory.service.Switch(`${this.config.name} - Available`, 'Available');
    this.switchAvailable.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);

    this.switchDnD = new PresenceAccessory.service.Switch(`${this.config.name} - DnD`, 'DnD');
    this.switchDnD.getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);

    // Register custom switches if needed
    const otherStates = Object.keys(this.config.statusColors).filter(status => status !== "available" && status !== "away" && status !== "busy" && status !== "donotdisturb");
    if (otherStates && otherStates.length > 0) {
      for (const state of otherStates) {
        this.activitySwitches[state.toLowerCase()] = new PresenceAccessory.service.Switch(`${this.config.name} - ${state}`, state);
        this.activitySwitches[state.toLowerCase()].getCharacteristic(PresenceAccessory.characteristic.On).updateValue(false);
      }
    }

    // Initialize the accessory
    this.init();
  }

  /**
   * Return the new accessory service
   */
  public getServices() {
    const informationService = new (PresenceAccessory.service as any).AccessoryInformation();
    const characteristic = PresenceAccessory.characteristic;
    informationService.setCharacteristic(characteristic.Manufacturer, 'Elio Struyf')
                      .setCharacteristic(characteristic.Model, 'Presence Indicator')
                      .setCharacteristic(characteristic.SerialNumber, 'PI_01')
                      .setCharacteristic(characteristic.FirmwareRevision, PresenceAccessory.version);
    const otherSwitches = Object.keys(this.activitySwitches);
    return [informationService, this.accessoryService, this.switchOff, this.switchDnD, this.switchBusy, this.switchAway, this.switchAvailable, ...otherSwitches.map(name => this.activitySwitches[name])];
  }

  /**
   * Initialize the button
   */
  private async init() {
    const storePath = PresenceAccessory.api.user.persistPath();
    this.storage = persist;
    await this.storage.init({
      dir: storePath,
      forgiveParseErrors: true
    });
  }

  /**
   * Set status event listener
   */
  private setStatus = (on: boolean, callback: () => void) => {
    if (on) {
      // Turned on
      this.auth = new Auth(this.config.tenantId, this.config.appId, this.storage);
      this.auth.ensureAccessToken(MSGRAPH_URL, this.log, this.config.debug).then(async (accessToken) => {
        if (this.config.onApi) {
          await BusyLightService.get(this.config.onApi, this.log, this.config.debug);
        }

        if (accessToken) {
          this.log.info(`Access token acquired.`);
          this.presencePolling();
        }
      });
    } else  {
      // Turned off
      if (this.timeoutIdx) {
        clearTimeout(this.timeoutIdx);
        this.timeoutIdx = null;
      }
    }

    callback();
  }

  /**
   * Presence polling
   */
  private presencePolling = async () => {
    const accessToken = await this.auth.ensureAccessToken(MSGRAPH_URL, this.log, this.config.debug);
    if (accessToken) {
      const shouldFetch = this.shouldCheckPresence();

      if (shouldFetch) {
        const presence: Presence = await MsGraphService.get(`${MSGRAPH_URL}/${MSGRAPH_PRESENCE_PATH}`, accessToken, this.log, this.config.debug);
        if (presence && presence.availability) {
          const availability = this.getAvailability(presence.availability);
          const activity = presence.activity;
          let color: RGB = this.config.statusColors[activity] || this.config.statusColors[availability.toLowerCase()];
          if (!color || (!color.red && !color.green && !color.blue)) {
            color = this.defaultColors[availability.toLowerCase()];
          }

          this.setSwitchState(availability, activity);

          if (this.config.setColorApi)  {
            await BusyLightService.post(this.config.setColorApi, color, this.log, this.config.debug);
          }
        }
      } else {
        this.setSwitchState(Availability.Offline, null);

        if (this.config.offApi) {
          await BusyLightService.get(this.config.offApi, this.log, this.config.debug);
        }
      }
    }

    this.timeoutIdx = setTimeout(() => {
      this.presencePolling();
    }, (this.config.interval > 0 ? this.config.interval : 1) * 60 * 1000);
  }

  /**
   * Turn the right state on/off of the state switches
   * @param availability
   */
  private setSwitchState(availability: Availability, activity: Activity) {
    const characteristic = PresenceAccessory.characteristic.On;

    if (activity && typeof this.activitySwitches[activity.toLowerCase()] !== "undefined") {
      for (const switchName of Object.keys(this.activitySwitches)) {
        const activitySwitch = this.activitySwitches[switchName];

        if (switchName === activity.toLowerCase()) {
          activitySwitch.getCharacteristic(characteristic).updateValue(true);
        } else {
          activitySwitch.getCharacteristic(characteristic).updateValue(false);
        }
      }

      this.switchAvailable.getCharacteristic(characteristic).updateValue(false);
      this.switchAway.getCharacteristic(characteristic).updateValue(false);
      this.switchBusy.getCharacteristic(characteristic).updateValue(false);
      this.switchOff.getCharacteristic(characteristic).updateValue(false);
      this.switchDnD.getCharacteristic(characteristic).updateValue(false);

      return;
    }

    this.switchAvailable.getCharacteristic(characteristic).updateValue(availability === Availability.Available);
    this.switchAway.getCharacteristic(characteristic).updateValue(availability === Availability.Away);
    this.switchBusy.getCharacteristic(characteristic).updateValue(availability === Availability.Busy);
    this.switchDnD.getCharacteristic(characteristic).updateValue(availability === Availability.DoNotDisturb);
    this.switchOff.getCharacteristic(characteristic).updateValue(availability !== Availability.DoNotDisturb && availability !== Availability.Busy && availability !== Availability.Away && availability !== Availability.Available);

    for (const switchName of Object.keys(this.activitySwitches)) {
      this.activitySwitches[switchName].getCharacteristic(characteristic).updateValue(false);
    }
  }

  /**
   * Retrieve the availability status
   *
   * @param presence
   */
  private getAvailability(presence: Availability) {
    switch(presence) {
      case Availability.Available:
      case Availability.AvailableIdle:
        return Availability.Available;
      case Availability.Away:
      case Availability.BeRightBack:
        return Availability.Away;
      case Availability.Busy:
      case Availability.BusyIdle:
        return Availability.Busy;
      case Availability.DoNotDisturb:
        return Availability.DoNotDisturb;
      case Availability.Offline:
      case Availability.PresenceUnknown:
      default:
        return Availability.Offline;
    }
  }

  /**
   * Should the accessory check the presence
   */
  private shouldCheckPresence() {
    // Check if switch is on or off
    const state = (this.accessoryService.getCharacteristic(PresenceAccessory.characteristic.On) as any).value;
    if (this.config.debug) {
      this.log.info(`Current accessory state is: ${JSON.stringify(state)}`);
    }
    if (!state) {
      return false;
    }

    const startTimeSplit = splitHours(this.config.startTime);
    const endTimeSplit = splitHours(this.config.endTime);
    if (this.config.debug) {
      this.log.info(`startTimeSplit: ${JSON.stringify(startTimeSplit)}.`);
      this.log.info(`endTimeSplit: ${JSON.stringify(endTimeSplit)}.`);
    }
    const crntDate = new Date();

    if(!this.config.weekend && (crntDate.getDay() === 6 || crntDate.getDay() === 0)) {
      if (this.config.debug) {
        this.log.info(`It's weekend, accessory will not set the busy light.`);
      }
      return false;
    }

    if (startTimeSplit && (crntDate.getHours() < startTimeSplit.hour || crntDate.getHours() === startTimeSplit.hour && crntDate.getMinutes() < startTimeSplit.minutes)) {
      if (this.config.debug) {
        this.log.info(`Presence doesn't need to be checked, before working hours.`);
      }
      return false;
    }

    if (endTimeSplit && (crntDate.getHours() > endTimeSplit.hour || crntDate.getHours() === endTimeSplit.hour && crntDate.getMinutes() > endTimeSplit.minutes)) {
      if (this.config.debug) {
        this.log.info(`Presence doesn't need to be checked, after working hours.`);
      }
      return false;
    }

    if (this.config.debug) {
      this.log.info(`Presence can be retrieved`);
    }
    return true;
  }
}
