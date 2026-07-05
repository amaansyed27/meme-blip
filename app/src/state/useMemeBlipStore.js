import { create } from 'zustand';
import { companionClient } from '../services/companionClient.js';

function slugBoardName(name) {
  return name.toLowerCase().split(' ').join('-');
}

function deriveBoards(sounds) {
  const counts = new Map();
  for (const sound of sounds) {
    const name = sound.board || 'Meme Kit';
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, sounds], index) => ({
    id: `board-${slugBoardName(name)}`,
    name,
    sounds,
    mode: name.toLowerCase().includes('meeting') ? 'Meetings' : 'Custom',
    accent: ['mint', 'blue', 'gold'][index % 3]
  }));
}

function applySoundUpdate(list, updated) {
  return list.map((sound) => sound.id === updated.id ? updated : sound);
}

export const useMemeBlipStore = create((set, get) => ({
  route: 'dashboard',
  query: '',
  companionOnline: false,
  loading: true,
  error: null,
  muted: false,
  activeSoundId: null,
  selectedDeviceId: null,
  monitorDeviceId: null,
  updateStatus: null,
  sounds: [],
  boards: [],
  devices: [],
  setRoute: (route) => set({ route }),
  setQuery: (query) => set({ query }),
  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const health = await companionClient.health();
      const sounds = await companionClient.sounds();
      const devices = await companionClient.devices();
      const settings = await companionClient.settings();
      set({
        companionOnline: Boolean(health.ok),
        sounds,
        boards: deriveBoards(sounds),
        devices,
        selectedDeviceId: settings.outputDeviceId || null,
        monitorDeviceId: settings.monitorDeviceId || null,
        loading: false
      });
    } catch (error) {
      set({ companionOnline: false, loading: false, error: error.message });
    }
  },
  setSelectedDevice: async (selectedDeviceId) => {
    set({ selectedDeviceId });
    try { await companionClient.setOutputDevice(selectedDeviceId); } catch (error) { set({ error: error.message }); }
  },
  setMonitorDevice: (monitorDeviceId) => set({ monitorDeviceId }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  playSound: async (id) => {
    if (get().muted) return;
    set({ activeSoundId: id, error: null });
    try {
      await companionClient.play(id);
      window.setTimeout(() => {
        if (get().activeSoundId === id) set({ activeSoundId: null });
      }, 900);
    } catch (error) {
      set({ activeSoundId: null, error: error.message });
    }
  },
  stopAll: async () => {
    set({ activeSoundId: null });
    try { await companionClient.stopAll(); } catch (error) { set({ error: error.message }); }
  },
  importSound: async (file) => {
    set({ error: null });
    try {
      const sound = await companionClient.importSound({ file, board: 'Meme Kit', volume: 80 });
      const sounds = [sound, ...get().sounds];
      set({ sounds, boards: deriveBoards(sounds) });
    } catch (error) {
      set({ error: error.message });
    }
  },
  updateSound: async (id, patch) => {
    try {
      const updated = await companionClient.updateSound(id, patch);
      const sounds = applySoundUpdate(get().sounds, updated);
      set({ sounds, boards: deriveBoards(sounds) });
    } catch (error) {
      set({ error: error.message });
    }
  },
  assignHotkey: async (id, hotkey) => {
    try {
      const updated = await companionClient.assignHotkey(id, hotkey);
      const sounds = applySoundUpdate(get().sounds, updated);
      set({ sounds, boards: deriveBoards(sounds) });
    } catch (error) {
      set({ error: error.message });
    }
  },
  deleteSound: async (id) => {
    try {
      await companionClient.deleteSound(id);
      const sounds = get().sounds.filter((sound) => sound.id !== id);
      set({ sounds, boards: deriveBoards(sounds) });
    } catch (error) {
      set({ error: error.message });
    }
  },
  testRoute: async () => {
    try { await companionClient.testRoute(); } catch (error) { set({ error: error.message }); }
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
}));
