import { Logger } from "../models";
import fetch from 'node-fetch';


export class BusyLightService {

  /**
   * Do a get request to the busy light
   * 
   * @param url 
   */
  public static async get(url: string, log: Logger, debug: boolean = false) {
    try {
      if (debug) {
        log.info(`Calling the busy light API: ${url}`);
      }
      const data = await fetch(url);
      if (debug) {
        log.info(`Call was: ${data.ok}`);
      }
    } catch (error) {
      log.warn(`Seems to be the busy light API was offline`);
    }
  }

  /**
   * Do a post request to the busy light
   * 
   * @param url 
   */
  public static async post(url: string, body: any, log: Logger, debug: boolean = false) {
    try {
      if (debug) {
        log.info(`Calling the busy light API: ${url} - ${JSON.stringify(body)}`);
      }
      const data = await fetch(url, { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(body)
      });
      if (debug) {
        log.info(`Call was: ${data.ok}`);
      }
    } catch (error) {
      log.warn(`Seems to be the busy light API was offline`);
    }
  }
}