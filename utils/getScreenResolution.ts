import robot from "@jitsi/robotjs";

interface ScreenSize {
  width: number;
  height: number;
}

export async function getScreenResolution(): Promise<ScreenSize> {
  const size = await robot.getScreenSize();
  return size;
}
