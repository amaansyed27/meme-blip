import { companionClient } from '../../services/companionClient.js';

export function createAudioSlice(set) {
  return {
    selectedDeviceId: null,
    monitorDeviceId: null,
    inputDeviceId: null,
    micPassthroughEnabled: true,
    mixerStatus: null,
    devices: [],
    inputDevices: [],
    refreshDevices: async () => {
      const devices = await companionClient.devices();
      const inputDevices = await companionClient.inputDevices();
      const mixerStatus = await companionClient.mixerStatus();
      set({ devices, inputDevices, mixerStatus });
    },
    setSelectedDevice: async (selectedDeviceId) => {
      set({ selectedDeviceId });
      try {
        await companionClient.setOutputDevice(selectedDeviceId);
        const devices = await companionClient.devices();
        const inputDevices = await companionClient.inputDevices();
        const mixerStatus = await companionClient.mixerStatus();
        set({ devices, inputDevices, mixerStatus });
      } catch (error) {
        set({ error: error.message });
      }
    },
    setMonitorDevice: async (monitorDeviceId) => {
      set({ monitorDeviceId });
      try {
        await companionClient.setMonitorDevice(monitorDeviceId);
        const devices = await companionClient.devices();
        const inputDevices = await companionClient.inputDevices();
        const mixerStatus = await companionClient.mixerStatus();
        set({ devices, inputDevices, mixerStatus });
      } catch (error) {
        set({ error: error.message });
      }
    },
    clearMonitorDevice: async () => {
      set({ monitorDeviceId: null });
      try {
        await companionClient.setMonitorDevice(null);
        const devices = await companionClient.devices();
        const inputDevices = await companionClient.inputDevices();
        const mixerStatus = await companionClient.mixerStatus();
        set({ devices, inputDevices, mixerStatus });
      } catch (error) {
        set({ error: error.message });
      }
    },
    setInputDevice: async (inputDeviceId) => {
      set({ inputDeviceId });
      try {
        await companionClient.setInputDevice(inputDeviceId);
        const devices = await companionClient.devices();
        const inputDevices = await companionClient.inputDevices();
        const mixerStatus = await companionClient.mixerStatus();
        set({ devices, inputDevices, mixerStatus });
      } catch (error) {
        set({ error: error.message });
      }
    },
    setMicPassthroughEnabled: async (micPassthroughEnabled) => {
      set({ micPassthroughEnabled });
      try {
        await companionClient.setMicPassthrough(micPassthroughEnabled);
        const mixerStatus = await companionClient.mixerStatus();
        set({ mixerStatus });
      } catch (error) {
        set({ error: error.message });
      }
    }
  };
}
