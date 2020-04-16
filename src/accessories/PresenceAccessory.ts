import { Homebridge, HomebridgeAccessory, PresenceConfig, Logger, Presence, Availability, StatusColors, RGB } from '../models';
import 'hap-nodejs';
import persist from 'node-persist';
import { Auth, splitHours } from '../helpers';
import { MsGraphService, BusyLightService } from '../services';

const MSGRAPH_URL = `https://graph.microsoft.com`;
const MSGRAPH_PRESENCE_PATH = `beta/me/presence`;

export class PresenceAccessory implements HomebridgeAccessory {
  private static api: Homebridge = null;
  private static service: HAPNodeJS.Service = null;
  private static characteristic: HAPNodeJS.Characteristic = null;
  private static version: string = null;

  private accessoryService: HAPNodeJS.Service = null;
  private storage: typeof persist;
  private auth: Auth = null;

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
    }
  };

  private config: PresenceConfig = {
    name: null,
    accessory: null,
    appId: null,
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
    return [informationService, this.accessoryService];
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
      this.auth = new Auth(this.config.appId, this.storage);
      this.auth.ensureAccessToken(MSGRAPH_URL, this.log, this.config.debug).then(async (accessToken) => {
        await BusyLightService.get(this.config.onApi, this.log, this.config.debug);

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
          let color: RGB = this.config.statusColors[availability.toLowerCase()];
          if (!color || (!color.red && !color.green && !color.blue)) {
            color = this.defaultColors[availability.toLowerCase()];
          }
          await BusyLightService.post(this.config.setColorApi, color, this.log, this.config.debug);
        }
      } else {
        await BusyLightService.get(this.config.offApi, this.log, this.config.debug);
      }
    }

    this.timeoutIdx = setTimeout(() => {
      this.presencePolling();
    }, (this.config.interval >= 1 ? this.config.interval : 1) * 60 * 1000);
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
      case Availability.DoNotDisturb:
        return Availability.Busy;
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
