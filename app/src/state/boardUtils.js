export function slugBoardName(name) {
  return name.toLowerCase().trim().split(/\s+/).join('-');
}

export function deriveBoards(sounds) {
  const counts = new Map();

  for (const sound of sounds) {
    const name = sound.board || 'Meme Kit';
    counts.set(name, (counts.get(name) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([name, sounds], index) => ({
    id: `board-${slugBoardName(name)}`,
    name,
    sounds,
    mode: sounds === 1 ? '1 clip' : `${sounds} clips`,
    accent: ['mint', 'blue', 'gold'][index % 3]
  }));
}

export function applySoundUpdate(list, updated) {
  return list.map((sound) => sound.id === updated.id ? updated : sound);
}
