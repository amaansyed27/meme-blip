const BASE_URL = 'http://127.0.0.1:48322';

async function request(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Companion request failed: ${response.status} ${detail}`);
  }

  return response.json();
}

export const companionClient = {
  health: () => request('/health'),
  sounds: () => request('/sounds'),
  boards: () => request('/boards'),
  devices: () => request('/devices'),
  settings: () => request('/settings'),
  importSound: ({ file, board, hotkey, volume }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('board', board || 'Meme Kit');
    form.append('hotkey', hotkey || '');
    form.append('volume', String(volume ?? 80));
    return request('/sounds/import', { method: 'POST', body: form });
  },
  deleteSound: (soundId) => request(`/sounds/${soundId}`, { method: 'DELETE' }),
  play: (soundId) => request(`/sounds/${soundId}/play`, { method: 'POST' }),
  stopAll: () => request('/sounds/stop-all', { method: 'POST' }),
  setOutputDevice: (deviceId) => request('/settings/output-device', { method: 'POST', body: JSON.stringify({ deviceId }) }),
  assignHotkey: (soundId, hotkey) => request(`/sounds/${soundId}/hotkey`, { method: 'POST', body: JSON.stringify({ hotkey }) })
};
