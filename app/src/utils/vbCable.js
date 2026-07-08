export const VB_CABLE_DOWNLOAD_URL = 'https://vb-audio.com/Cable/';

function deviceName(device) {
  return String(device?.name || '').toLowerCase();
}

export function isCableInputDevice(device) {
  const name = deviceName(device);
  return name.includes('cable input') && !name.includes('16ch');
}

export function isCableOutputDevice(device) {
  const name = deviceName(device);
  return name.includes('cable output') && !name.includes('16ch');
}

export function getVbCableStatus(devices = [], inputDevices = []) {
  const hasCableInput = devices.some(isCableInputDevice);
  const hasCableOutput = inputDevices.some(isCableOutputDevice);

  return {
    hasCableInput,
    hasCableOutput,
    ready: hasCableInput && hasCableOutput
  };
}
