import type { Team } from '../types/bracket';
import { Icon } from './Icon';
import { TeamLogo } from './TeamLogo';

export function ChampionCard({ champion }: { champion: Team | undefined }) {
  return (
    <div className={`champion${champion ? ' champion--selected' : ''}`} role="status" aria-live="polite" data-testid="champion">
      <div className="champion-label"><Icon name="trophy" size={14} /><span>{champion ? 'Votre champion' : 'Le titre attend son équipe'}</span></div>
      {champion
        ? <div className="champion-team"><TeamLogo team={champion} large /><strong>{champion.name}</strong></div>
        : <p>À vous d’écrire la finale.</p>}
    </div>
  );
}
