import { create } from 'zustand';
import { starterSounds, boards, devices } from '../data/seedData.js';

export const useMemeBlipStore = create((set, get) => ({
  route: 'dashboard',
  query: '',
  companionOnline: true,
  muted: false,
  activeSoundId: null,
  selectedDeviceId: 'd2',
  monitorDeviceId: 'd1',
  sounds: starterSounds,
  boards,
  devices,
  setRoute: (route) => set({ route }),
  setQuery: (query) => set({ query }),
  setSelectedDevice: (selectedDeviceId) => set({ selectedDeviceId }),
  setMonitorDevice: (monitorDeviceId) => set({ monitorDeviceId }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  playSound: (id) => {
    if (get().muted) return;
    set({ activeSoundId: id });
    window.setTimeout(() => {
      if (get().activeSoundId === id) set({ activeSoundId: null });
    }, 900);
  },
  stopAll: () => set({ activeSoundId: null }),
  addDemoSound: () => set((state) => ({
    sounds: [
      {
        id: `s${state.sounds.length + 1}`,
        name: 'New Clip',
        board: 'Meme Kit',
        key: 'Unassigned',
        volume: 70,
        duration: '1.0s',
        color: 'mint'
      },
      ...state.sounds
    ]
  }))
}));
