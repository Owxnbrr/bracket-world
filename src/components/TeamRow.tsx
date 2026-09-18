import type { Team, TeamSource } from '../types/bracket';
import { sourceLabel } from '../lib/bracket';
import { Icon } from './Icon';
import { TeamLogo } from './TeamLogo';

interface TeamRowProps {
  team: Team | undefined;
  source: TeamSource;
  winnerId: string | undefined;
  matchId: string;
  index: number;
  onPick: (matchId: string, teamId: string) => void;
}

export function TeamRow({ team, source, winnerId, matchId, index, onPick }: TeamRowProps) {
  const status = !winnerId ? 'normal' : winnerId === team?.id ? 'winner' : 'loser';
  const label = team?.name ?? sourceLabel(source);
  return (
    <button
      type="button"
      className={`team-row team-row--${status}${!team ? ' team-row--pending' : ''}`}
      data-team-slot={index}
      data-team-id={team?.id}
      disabled={!team}
      aria-pressed={Boolean(team && winnerId === team.id)}
      aria-label={team ? `Choisir ${team.name}, ${matchId}` : label}
      title={team ? `${team.name} · Cliquer pour choisir le vainqueur` : label}
      onClick={() => { if (team) onPick(matchId, team.id); }}
    >
      {team ? <TeamLogo team={team} /> : <span className="pending-logo" aria-hidden="true">—</span>}
      <span className="team-name">{label}</span>
      <span className="team-result" aria-hidden="true">{status === 'winner' && <Icon name="check" size={12} />}</span>
    </button>
  );
}
