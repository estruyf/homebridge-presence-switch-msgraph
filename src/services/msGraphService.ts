import fetch from 'node-fetch';
import { Logger } from '../models';

export class MsGraphService {
  
  /**
   * Perform a get request against the MS Graph
   * 
   * @param url 
   * @param accessToken 
   */
  public static async get(url: string, accessToken: string, log: Logger, debug: boolean = false) {
    try {
      if (debug) {
        log.info(`Calling the MS Graph.`);
      }
  
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `application/json`,
          'Accept': `application/json`
        }
      });
  
      const data = await response.json();
      if (debug) {
        log.info(`MS Graph response: ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      log.warn(`Something failed while calling the MSGraph`);
      log.warn(error.message);
    }
  }
}