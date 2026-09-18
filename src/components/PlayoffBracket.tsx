import { useRef } from 'react';
import { rounds } from '../data/bracket';
import type { BracketState } from '../types/bracket';
import { BracketConnections } from './BracketConnections';
import { ChampionCard } from './ChampionCard';
import { Icon } from './Icon';
import { RoundColumn } from './RoundColumn';

export function PlayoffBracket({ bracket, onPick }: { bracket: BracketState; onPick: (matchId: string, teamId: string) => void }) {
  const boardRef = useRef<HTMLDivElement>(null);
  return (
    <div className="bracket-scroll" role="region" aria-label="Bracket interactif des playoffs, défilement horizontal disponible" tabIndex={0}>
      <div className="bracket-board" ref={boardRef}>
        <div className="board-note">
          <span className="eyebrow">LE CHEMIN VERS LE TITRE</span>
          <p>12 équipes.<br /><span>Un seul champion.</span></p>
          <span className="board-note-caption">Faites vos choix, round après round.<Icon name="arrow" size={16} /></span>
        </div>
        <BracketConnections boardRef={boardRef} bracket={bracket} />
        {rounds.map((round) => (
          <RoundColumn key={round.id} round={round} bracket={bracket} onPick={onPick}>
            {round.id === 'final' && <ChampionCard champion={bracket.matches.GF?.winner} />}
          </RoundColumn>
        ))}
      </div>
    </div>
  );
}
