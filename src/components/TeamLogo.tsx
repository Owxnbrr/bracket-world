import { useState } from 'react';
import type { Team } from '../types/bracket';

// Vite's manifest avoids making requests for logo files that are not installed.
const availableLogos = new Set(__AVAILABLE_LOGOS__);

export function teamInitials(team: Pick<Team, 'name' | 'shortName'>): string {
  return team.shortName || team.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
}

export function TeamLogo({ team, large = false }: { team: Team; large?: boolean }) {
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const available = availableLogos.has(team.logo);
  return (
    <span className={`team-logo${large ? ' team-logo--large' : ''}`} aria-hidden="true">
      {available && failedLogo !== team.logo
        ? <img src={team.logo} alt="" width={large ? 32 : 23} height={large ? 32 : 23} onError={() => setFailedLogo(team.logo)} />
        : <span className="team-initials">{teamInitials(team)}</span>}
    </span>
  );
}
