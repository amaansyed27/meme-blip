import { companionClient } from '../../services/companionClient.js';
import { deriveBoards } from '../boardUtils.js';

export function createAppSlice(set) {
  return {
    companionOnline: false,
    loading: true,
    error: null,
    updateStatus: null,
    initialize: async () => {
      set({ loading: true, error: null });
      try {
        const health = await companionClient.health();
        const sounds = await companionClient.sounds();
        const devices = await companionClient.devices();
        const inputDevices = await companionClient.inputDevices();
        const settings = await companionClient.settings();
        const mixerStatus = await companionClient.mixerStatus();

        set({
          companionOnline: Boolean(health.ok),
          sounds,
          boards: deriveBoards(sounds),
          devices,
          inputDevices,
          selectedDeviceId: settings.outputDeviceId || null,
          monitorDeviceId: settings.monitorDeviceId || null,
          inputDeviceId: settings.inputDeviceId || null,
          activeBoard: settings.activeBoard || null,
          micPassthroughEnabled: settings.micPassthroughEnabled ?? true,
          mixerStatus,
          loading: false
        });
      } catch (error) {
        set({ companionOnline: false, loading: false, error: error.message });
      }
    },
    checkUpdate: async () => {
      try {
        const updateStatus = await companionClient.checkUpdate();
        set({ updateStatus });
      } catch (error) {
        set({ error: error.message });
      }
    },
    downloadUpdate: async () => {
      try {
        const updateStatus = await companionClient.downloadUpdate();
        set({ updateStatus });
      } catch (error) {
        set({ error: error.message });
      }
    }
  };
}
