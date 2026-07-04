export const routes = [
  { id: 'dashboard', label: 'Dashboard', icon: 'radio' },
  { id: 'sounds', label: 'Sounds', icon: 'laugh' },
  { id: 'boards', label: 'Soundboards', icon: 'gamepad' },
  { id: 'hotkeys', label: 'Hotkeys', icon: 'zap' },
  { id: 'routing', label: 'Audio Routing', icon: 'megaphone' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

export const starterSounds = [
  { id: 's1', name: 'Vine Boom', board: 'Meme Kit', key: 'Alt + 1', volume: 82, duration: '0.9s', color: 'gold' },
  { id: 's2', name: 'Bruh', board: 'Meme Kit', key: 'Alt + 2', volume: 76, duration: '1.1s', color: 'mint' },
  { id: 's3', name: 'Round Lost', board: 'Gaming', key: 'Alt + 3', volume: 68, duration: '2.3s', color: 'red' },
  { id: 's4', name: 'Awkward Pause', board: 'Meetings', key: 'Ctrl + Shift + P', volume: 64, duration: '1.7s', color: 'blue' }
];

export const boards = [
  { id: 'b1', name: 'Game Stack', sounds: 18, mode: 'Gaming', accent: 'mint' },
  { id: 'b2', name: 'Meeting Reactions', sounds: 9, mode: 'Meetings', accent: 'blue' },
  { id: 'b3', name: 'Brainrot Lite', sounds: 24, mode: 'Fun', accent: 'gold' }
];

export const devices = [
  { id: 'd1', name: 'Headphones', type: 'Monitor', status: 'Ready' },
  { id: 'd2', name: 'Cable Input', type: 'Virtual route', status: 'Selected' },
  { id: 'd3', name: 'Mixer Input', type: 'Virtual mixer', status: 'Available' }
];
