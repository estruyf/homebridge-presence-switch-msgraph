export interface Homebridge {
  _accessories: Accessories;
  _platforms: Accessories;
  _configurableAccessories: Accessories;
  _dynamicPlatforms: Accessories;
  version: number;
  serverVersion: string;
  hap: Hap;
  user: User;
  hapLegacyTypes: HapLegacyTypes;
  platformAccessory: any;
  _events: Accessories;
  _eventsCount: number;

  registerAccessory: (pluginName: string, platformName: string, constructor: any) => void;
  registerPlatform: (pluginName: string, platformName: string, constructor: any, dynamic: boolean) => void;
  registerPlatformAccessories: (pluginName: string, platformName: string, accessories: Accessories) => void;

  updatePlatformAccessories: (accessories: Accessories) => void;

  unregisterPlatformAccessories: (pluginName: string, platformName: string, accessories: Accessories) => void;

  on: (eventName: string, callback: () => void) => void;
}

export interface HapLegacyTypes {
  OTHER_TCTYPE: number;
  FAN_TCTYPE: number;
  GARAGE_DOOR_OPENER_TCTYPE: number;
  LIGHTBULB_TCTYPE: number;
  DOOR_LOCK_TCTYPE: number;
  OUTLET_TCTYPE: number;
  SWITCH_TCTYPE: number;
  THERMOSTAT_TCTYPE: number;
  SENSOR_TCTYPE: number;
  ALARM_SYSTEM_TCTYPE: number;
  DOOR_TCTYPE: number;
  WINDOW_TCTYPE: number;
  WINDOW_COVERING_TCTYPE: number;
  PROGRAMMABLE_SWITCH_TCTYPE: number;
  LIGHTBULB_STYPE: string;
  SWITCH_STYPE: string;
  THERMOSTAT_STYPE: string;
  GARAGE_DOOR_OPENER_STYPE: string;
  ACCESSORY_INFORMATION_STYPE: string;
  FAN_STYPE: string;
  OUTLET_STYPE: string;
  LOCK_MECHANISM_STYPE: string;
  LOCK_MANAGEMENT_STYPE: string;
  ALARM_STYPE: string;
  WINDOW_COVERING_STYPE: string;
  OCCUPANCY_SENSOR_STYPE: string;
  CONTACT_SENSOR_STYPE: string;
  MOTION_SENSOR_STYPE: string;
  HUMIDITY_SENSOR_STYPE: string;
  TEMPERATURE_SENSOR_STYPE: string;
  ALARM_CURRENT_STATE_CTYPE: string;
  ALARM_TARGET_STATE_CTYPE: string;
  ADMIN_ONLY_ACCESS_CTYPE: string;
  AUDIO_FEEDBACK_CTYPE: string;
  BRIGHTNESS_CTYPE: string;
  BATTERY_LEVEL_CTYPE: string;
  COOLING_THRESHOLD_CTYPE: string;
  CONTACT_SENSOR_STATE_CTYPE: string;
  CURRENT_DOOR_STATE_CTYPE: string;
  CURRENT_LOCK_MECHANISM_STATE_CTYPE: string;
  CURRENT_RELATIVE_HUMIDITY_CTYPE: string;
  CURRENT_TEMPERATURE_CTYPE: string;
  HEATING_THRESHOLD_CTYPE: string;
  HUE_CTYPE: string;
  IDENTIFY_CTYPE: string;
  LOCK_MANAGEMENT_AUTO_SECURE_TIMEOUT_CTYPE: string;
  LOCK_MANAGEMENT_CONTROL_POINT_CTYPE: string;
  LOCK_MECHANISM_LAST_KNOWN_ACTION_CTYPE: string;
  LOGS_CTYPE: string;
  MANUFACTURER_CTYPE: string;
  MODEL_CTYPE: string;
  MOTION_DETECTED_CTYPE: string;
  NAME_CTYPE: string;
  OBSTRUCTION_DETECTED_CTYPE: string;
  OUTLET_IN_USE_CTYPE: string;
  OCCUPANCY_DETECTED_CTYPE: string;
  POWER_STATE_CTYPE: string;
  PROGRAMMABLE_SWITCH_SWITCH_EVENT_CTYPE: string;
  PROGRAMMABLE_SWITCH_OUTPUT_STATE_CTYPE: string;
  ROTATION_DIRECTION_CTYPE: string;
  ROTATION_SPEED_CTYPE: string;
  SATURATION_CTYPE: string;
  SERIAL_NUMBER_CTYPE: string;
  STATUS_LOW_BATTERY_CTYPE: string;
  STATUS_FAULT_CTYPE: string;
  TARGET_DOORSTATE_CTYPE: string;
  TARGET_LOCK_MECHANISM_STATE_CTYPE: string;
  TARGET_RELATIVE_HUMIDITY_CTYPE: string;
  TARGET_TEMPERATURE_CTYPE: string;
  TEMPERATURE_UNITS_CTYPE: string;
  VERSION_CTYPE: string;
  WINDOW_COVERING_TARGET_POSITION_CTYPE: string;
  WINDOW_COVERING_CURRENT_POSITION_CTYPE: string;
  WINDOW_COVERING_OPERATION_STATE_CTYPE: string;
  CURRENTHEATINGCOOLING_CTYPE: string;
  TARGETHEATINGCOOLING_CTYPE: string;
}

export interface Hap {
  uuid: HAPNodeJS.uuid;
  AccessoryLoader: Accessories;
  Characteristic: HAPNodeJS.Characteristic;
  Service: HAPNodeJS.Service;
}

export interface Accessories {
}

export interface Accessory {
  displayName: string;
}

export interface User {
  config: () => any;
  storagePath: () => string;
  configPath: () => string;
  persistPath: () => string;
  cachedAccessoryPath: () => string;
  setStoragePath: (storagePath: string) => void;
}