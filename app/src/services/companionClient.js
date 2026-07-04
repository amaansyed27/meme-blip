const BASE_URL = 'http://127.0.0.1:48322';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Companion request failed: ${response.status}`);
  }

  return response.json();
}

export const companionClient = {
  health: () => request('/health'),
  devices: () => request('/devices'),
  play: (soundId) => request(`/sounds/${soundId}/play`, { method: 'POST' }),
  stopAll: () => request('/sounds/stop-all', { method: 'POST' }),
  setOutputDevice: (deviceId) => request('/settings/output-device', { method: 'POST', body: JSON.stringify({ deviceId }) })
};
