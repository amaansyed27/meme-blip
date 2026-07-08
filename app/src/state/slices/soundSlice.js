import { companionClient } from '../../services/companionClient.js';
import { applySoundUpdate, deriveBoards } from '../boardUtils.js';

function applyBoardSettings(set, get, settings) {
  const customBoards = settings.customBoards || [];
  const favoriteBoards = settings.favoriteBoards || [];
  set({
    customBoards,
    favoriteBoards,
    activeBoard: settings.activeBoard || null,
    boards: deriveBoards(get().sounds, customBoards, favoriteBoards)
  });
}

export function createSoundSlice(set, get) {
  return {
    sounds: [],
    boards: [],
    customBoards: [],
    favoriteBoards: [],
    activeBoard: null,
    setActiveBoard: async (activeBoard) => {
      set({ activeBoard });
      try {
        const settings = await companionClient.setActiveBoard(activeBoard);
        applyBoardSettings(set, get, settings);
      } catch (error) {
        set({ error: error.message });
      }
    },
    createBoard: async (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const settings = await companionClient.createBoard(trimmed);
        applyBoardSettings(set, get, settings);
      } catch (error) {
        set({ error: error.message });
      }
    },
    setFavoriteBoard: async (board, favorite) => {
      try {
        const settings = await companionClient.setFavoriteBoard(board, favorite);
        applyBoardSettings(set, get, settings);
      } catch (error) {
        set({ error: error.message });
      }
    },
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
    previewSound: async (id) => {
      if (get().muted) return;
      set({ activeSoundId: id, error: null });
      try {
        await companionClient.preview(id);
        window.setTimeout(() => {
          if (get().activeSoundId === id) set({ activeSoundId: null });
        }, 900);
      } catch (error) {
        set({ activeSoundId: null, error: error.message });
      }
    },
    stopAll: async () => {
      set({ activeSoundId: null });
      try {
        await companionClient.stopAll();
      } catch (error) {
        set({ error: error.message });
      }
    },
    importSound: async (file) => {
      set({ error: null });
      try {
        const sound = await companionClient.importSound({ file, board: get().activeBoard || 'Meme Kit', volume: 80 });
        const sounds = [sound, ...get().sounds];
        set({ sounds, boards: deriveBoards(sounds, get().customBoards, get().favoriteBoards) });
      } catch (error) {
        set({ error: error.message });
      }
    },
    importRemoteSound: async (remoteSound) => {
      set({ error: null });
      try {
        const sound = await companionClient.importSoundUrl({
          title: remoteSound.title,
          mp3: remoteSound.mp3,
          board: get().activeBoard || 'Meme Kit',
          volume: 80
        });
        const sounds = [sound, ...get().sounds];
        set({ sounds, boards: deriveBoards(sounds, get().customBoards, get().favoriteBoards) });
        return sound;
      } catch (error) {
        set({ error: error.message });
        throw error;
      }
    },
    updateSound: async (id, patch) => {
      try {
        const updated = await companionClient.updateSound(id, patch);
        const sounds = applySoundUpdate(get().sounds, updated);
        set({ sounds, boards: deriveBoards(sounds, get().customBoards, get().favoriteBoards) });
      } catch (error) {
        set({ error: error.message });
      }
    },
    assignHotkey: async (id, hotkey) => {
      try {
        const updated = await companionClient.assignHotkey(id, hotkey);
        const sounds = applySoundUpdate(get().sounds, updated);
        set({ sounds, boards: deriveBoards(sounds, get().customBoards, get().favoriteBoards) });
      } catch (error) {
        set({ error: error.message });
      }
    },
    deleteSound: async (id) => {
      try {
        await companionClient.deleteSound(id);
        const sounds = get().sounds.filter((sound) => sound.id !== id);
        set({ sounds, boards: deriveBoards(sounds, get().customBoards, get().favoriteBoards) });
      } catch (error) {
        set({ error: error.message });
      }
    }
  };
}
