import type { CSSProperties, ReactNode } from 'react';
import type { BracketState, Round } from '../types/bracket';
import { MatchCard } from './MatchCard';

export function RoundColumn({ round, bracket, onPick, children }: {
  round: Round;
  bracket: BracketState;
  onPick: (matchId: string, teamId: string) => void;
  children?: ReactNode;
}) {
  return (
    <section className={`round round--${round.level}`} style={{ '--column': round.column } as CSSProperties} aria-labelledby={`round-${round.id}`}>
      <h2 id={`round-${round.id}`} className="round-title" lang="en">{round.title}</h2>
      <div className="round-matches">
        {round.matches.map(({ id, slot }) => {
          const match = bracket.matches[id];
          return match ? <MatchCard key={id} match={match} slot={slot} onPick={onPick} /> : null;
        })}
        {children}
      </div>
    </section>
  );
}
