
export const splitHours = (time: string): { hour: number, minutes: number} | null => {
  if (time && time.includes(":")) {
    const daySplit = time.split(":");
    return {
      hour: parseInt(daySplit[0]),
      minutes: parseInt(daySplit[1])
    }
  }

  return null;
}