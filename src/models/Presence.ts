import { Availability } from ".";

export interface Presence {
  id: string;
  availability: Availability;
  activity: string;
}