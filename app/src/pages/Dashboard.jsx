import { Keyboard, Play, Upload } from 'lucide-react';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

function getRouteName({ mixerStatus, devices, selectedDeviceId }) {
  return (
    mixerStatus?.outputDeviceName ||
    mixerStatus?.output_device_name ||
    devices.find((device) => device.id === selectedDeviceId)?.name ||
    selectedDeviceId ||
    'Not selected'
  );
}

export function Dashboard() {
  const sounds = useMemeBlipStore((state) => state.sounds);
  const boards = useMemeBlipStore((state) => state.boards);
  const importSound = useMemeBlipStore((state) => state.importSound);
  const previewSound = useMemeBlipStore((state) => state.previewSound);
  const companionOnline = useMemeBlipStore((state) => state.companionOnline);
  const activeBoard = useMemeBlipStore((state) => state.activeBoard);
  const devices = useMemeBlipStore((state) => state.devices);
  const selectedDeviceId = useMemeBlipStore((state) => state.selectedDeviceId);
  const mixerStatus = useMemeBlipStore((state) => state.mixerStatus);
  const selectedBoard = boards.find((board) => board.name === activeBoard) || boards[0];
  const selectedBoardSounds = selectedBoard ? sounds.filter((sound) => sound.board === selectedBoard.name) : [];
  const routeName = getRouteName({ mixerStatus, devices, selectedDeviceId });

  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="MemeBlip"
        description="Local clip playback, hotkeys, mic passthrough, and VB-CABLE routing."
        action={<label className="primary-button file-button"><Upload size={16} /> Import<input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && importSound(event.target.files[0])} /></label>}
      />

      <section className="metric-grid dashboard-metrics">
        <MetricCard label="Clips" value={sounds.length} detail="Imported sounds" tone="wave" />
        <MetricCard label="Boards" value={boards.length} detail="All boards" tone="grid" />
        <MetricCard label="Companion" value={companionOnline ? 'Online' : 'Offline'} detail="Local playback API" tone={companionOnline ? 'online' : 'offline'} />
        <MetricCard label="Route" value={routeName} detail="Selected output" tone="route" />
      </section>

      <section className="dashboard-showcase" aria-label="Selected soundboard preview">
        <div className="showcase-heading">
          <div>
            <p className="eyebrow">Selected soundboard</p>
            {selectedBoard ? (
              <div className="showcase-title-row">
                <span className="board-emoji" aria-hidden="true">🎛️</span>
                <div>
                  <h2>{selectedBoard.name}</h2>
                  <p>Preview clips from this board and check the current key map.</p>
                </div>
                {selectedBoard.favorite ? <span className="active-board-pill">Favorite</span> : null}
              </div>
            ) : (
              <div className="showcase-title-row">
                <span className="board-emoji" aria-hidden="true">＋</span>
                <div>
                  <h2>No board selected</h2>
                  <p>Create or import a soundboard to link clips and hotkeys.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedBoardSounds.length ? (
          <div className="showcase-list">
            <div className="showcase-column-labels" aria-hidden="true">
              <span>Sound</span>
              <span>Key map</span>
            </div>
            {selectedBoardSounds.slice(0, 8).map((sound) => (
              <article className="showcase-sound-row" key={sound.id}>
                <button className="sound-play" onClick={() => previewSound(sound.id)} aria-label={`Preview ${sound.name}`}><Play size={13} fill="currentColor" /></button>
                <strong>{sound.name}</strong>
                <span className={sound.hotkey ? 'key-map assigned' : 'key-map empty'}><Keyboard size={13} /> {sound.hotkey || 'No key assigned'}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state dashboard-empty">
            {selectedBoard ? 'No clips on this board yet. Import audio while this board is selected.' : 'Create or import a soundboard to link hotkeys.'}
          </div>
        )}
      </section>
    </>
  );
}
