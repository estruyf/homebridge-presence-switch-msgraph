

export interface HomebridgeAccessory {
  getServices: () => HAPNodeJS.Service[];
}