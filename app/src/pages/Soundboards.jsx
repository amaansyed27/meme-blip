import { Plus } from 'lucide-react';
import { BoardCard } from '../components/BoardCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useMemeBlipStore } from '../state/useMemeBlipStore.js';

export function Soundboards() {
  const boards = useMemeBlipStore((state) => state.boards);

  return (
    <>
      <PageHeader
        eyebrow="Boards"
        title="Separate gaming chaos from meeting reactions."
        description="Boards are focused sets of clips. Enable one board at a time for cleaner hotkey behavior."
        action={<button className="primary-button"><Plus size={18} /> New board</button>}
      />
      <section className="board-grid">{boards.map((board) => <BoardCard key={board.id} board={board} />)}</section>
      <section className="panel workflow-panel">
        <h2>Board rules</h2>
        <div className="rule-list">
          <article><strong>Gaming mode</strong><p>Short clips, hard stop key, conservative volume.</p></article>
          <article><strong>Meeting mode</strong><p>Muted by default, monitor preview before routing.</p></article>
          <article><strong>Fun mode</strong><p>Loose keybinds and louder local speaker playback.</p></article>
        </div>
      </section>
    </>
  );
}
