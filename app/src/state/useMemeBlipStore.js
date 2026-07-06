import { create } from 'zustand';
import { createAppSlice } from './slices/appSlice.js';
import { createAudioSlice } from './slices/audioSlice.js';
import { createSoundSlice } from './slices/soundSlice.js';
import { createUiSlice } from './slices/uiSlice.js';

export const useMemeBlipStore = create((set, get) => ({
  ...createUiSlice(set, get),
  ...createAppSlice(set, get),
  ...createAudioSlice(set, get),
  ...createSoundSlice(set, get)
}));
