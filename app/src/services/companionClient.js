const BASE_URL = window.location.origin.includes('48322') ? window.location.origin : 'http://127.0.0.1:48322';
let apiToken = null;

async function readHealth() {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error(`Companion health failed: ${response.status}`);
  const health = await response.json();
  apiToken = health.apiToken;
  return health;
}

async function request(path, options = {}) {
  if (path !== '/health' && !apiToken) {
    await readHealth();
  }

  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  if (apiToken) headers['x-memeblip-token'] = apiToken;

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
  health: () => readHealth(),
  sounds: () => request('/sounds'),
  boards: () => request('/boards'),
  devices: () => request('/devices'),
  settings: () => request('/settings'),
  checkUpdate: () => request('/updates/check'),
  downloadUpdate: () => request('/updates/download', { method: 'POST' }),
  testRoute: () => request('/devices/test', { method: 'POST' }),
  importSound: ({ file, board, hotkey, volume }) => {
    const form = new FormData();
    form.append('file', file);
    form.append('board', board || 'Meme Kit');
    form.append('hotkey', hotkey || '');
    form.append('volume', String(volume ?? 80));
    return request('/sounds/import', { method: 'POST', body: form });
  },
  updateSound: (soundId, patch) => request(`/sounds/${soundId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteSound: (soundId) => request(`/sounds/${soundId}`, { method: 'DELETE' }),
  play: (soundId) => request(`/sounds/${soundId}/play`, { method: 'POST' }),
  stopAll: () => request('/sounds/stop-all', { method: 'POST' }),
  setOutputDevice: (deviceId) => request('/settings/output-device', { method: 'POST', body: JSON.stringify({ deviceId }) }),
  assignHotkey: (soundId, hotkey) => request(`/sounds/${soundId}/hotkey`, { method: 'POST', body: JSON.stringify({ hotkey }) })
};
