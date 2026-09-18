import type { CSSProperties } from 'react';
import type { ResolvedMatch } from '../types/bracket';
import { TeamRow } from './TeamRow';

export function MatchCard({ match, slot, onPick }: { match: ResolvedMatch; slot: number; onPick: (matchId: string, teamId: string) => void }) {
  return (
    <article className="match" style={{ '--slot': slot } as CSSProperties} aria-label={match.label} data-testid={`match-${match.id}`}>
      <span className="match-label">{match.id === 'GF' ? 'LA FINALE' : match.id}</span>
      <div className={`match-card${match.winner ? ' match-card--picked' : ''}`} data-match-id={match.id}>
        {match.sources.map((source, index) => (
          <TeamRow key={index} team={match.teams[index]} source={source} index={index} matchId={match.id} winnerId={match.winner?.id} onPick={onPick} />
        ))}
      </div>
    </article>
  );
}
