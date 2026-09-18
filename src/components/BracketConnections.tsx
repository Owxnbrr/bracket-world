import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { matches } from '../data/bracket';
import type { BracketState } from '../types/bracket';

interface Connection { id: string; path: string; sourceId: string; outcome: 'winner' | 'loser' }
interface Geometry { width: number; height: number; connections: Connection[] }

export function BracketConnections({ boardRef, bracket }: { boardRef: RefObject<HTMLDivElement | null>; bracket: BracketState }) {
  const [geometry, setGeometry] = useState<Geometry>({ width: 0, height: 0, connections: [] });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let frame = 0;
    const measure = () => {
      const bounds = board.getBoundingClientRect();
      const cards = new Map(Array.from(board.querySelectorAll<HTMLElement>('[data-match-id]')).map((element) => [element.dataset.matchId, element]));
      const connections: Connection[] = [];

      for (const match of matches) {
        const destination = cards.get(match.id);
        if (!destination) continue;
        match.sources.forEach((source, index) => {
          if (source.type === 'team') return;
          const origin = cards.get(source.matchId);
          const targetRow = destination.querySelector(`[data-team-slot="${index}"]`);
          if (!origin || !targetRow) return;
          const from = origin.getBoundingClientRect();
          const to = targetRow.getBoundingClientRect();
          const sameColumn = Math.abs(from.left - destination.getBoundingClientRect().left) < 1;
          const x1 = (sameColumn ? from.left : from.right) - bounds.left;
          const y1 = from.top + from.height / 2 - bounds.top;
          const x2 = to.left - bounds.left;
          const y2 = to.top + to.height / 2 - bounds.top;
          const columnGap = parseFloat(getComputedStyle(board).getPropertyValue('--column-gap'));
          const secondBranch = source.matchId.endsWith('-B');
          // Separate channels for upper winners and upper losers keep shared gutters legible.
          const lane = sameColumn
            ? x1 - columnGap * (secondBranch ? 0.65 : 0.32)
            : x1 + (x2 - x1) * (source.matchId.startsWith('UQF') ? (secondBranch ? 0.78 : 0.6) : 0.3);
          connections.push({ id: `${source.matchId}-${match.id}-${index}`, sourceId: source.matchId, outcome: source.type, path: `M ${x1} ${y1} H ${lane} V ${y2} H ${x2}` });
        });
      }
      setGeometry({ width: board.scrollWidth, height: board.scrollHeight, connections });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(board);
    board.querySelectorAll('[data-match-id]').forEach((card) => observer.observe(card));
    window.addEventListener('resize', schedule);
    return () => { observer.disconnect(); window.removeEventListener('resize', schedule); cancelAnimationFrame(frame); };
  }, [boardRef]);

  return (
    <svg className="bracket-connections" width={geometry.width} height={geometry.height} aria-hidden="true">
      {geometry.connections.map((connection) => (
        <path key={connection.id} d={connection.path} data-connection={connection.id} className={`connection${connection.outcome === 'loser' ? ' connection--loser' : ''}${bracket.matches[connection.sourceId]?.[connection.outcome] ? ' connection--resolved' : ''}`} />
      ))}
    </svg>
  );
}
