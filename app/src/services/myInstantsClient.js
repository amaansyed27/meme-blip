const MYINSTANTS_API_BASE = 'https://myinstants-api.vercel.app';

async function request(path) {
  const response = await fetch(`${MYINSTANTS_API_BASE}${path}`);
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`MyInstants request failed: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  if (payload.status && payload.status >= 400) {
    throw new Error(payload.message || 'MyInstants request failed');
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

function safeQuery(value) {
  return encodeURIComponent(String(value || '').trim());
}

export const myInstantsClient = {
  search: (query) => request(`/search?q=${safeQuery(query)}`),
  trending: (region = 'us') => request(`/trending?q=${safeQuery(region)}`),
  recent: () => request('/recent'),
  best: (region = 'us') => request(`/best?q=${safeQuery(region)}`)
};
