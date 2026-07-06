export function createUiSlice(set) {
  return {
    route: 'dashboard',
    query: '',
    muted: false,
    activeSoundId: null,
    setRoute: (route) => set({ route }),
    setQuery: (query) => set({ query }),
    toggleMute: () => set((state) => ({ muted: !state.muted }))
  };
}
