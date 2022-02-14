/**
 * Converts a number of seconds to a human readable time string.
 */
export function toReadableTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = seconds % 60;

  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = secondsLeft.toString().padStart(2, "0");

  return hoursString + ":" + minutesString + ":" + secondsString;
}
