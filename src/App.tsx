import { useState } from 'react';
import { matches } from './data/bracket';
import { useBracketPredictions } from './hooks/useBracketPredictions';
import { Icon } from './components/Icon';
import { PlayoffBracket } from './components/PlayoffBracket';
import { ResetDialog } from './components/ResetDialog';

export function App() {
  const { bracket, pickWinner, reset, storageAvailable, count } = useBracketPredictions();
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <>
      <a className="skip-link" href="#playoffs">Aller au bracket</a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="./" aria-label="RLCS Pick’em, accueil"><Icon name="bracket" size={27} /><span>RLCS<span className="brand-divider">/</span><span className="brand-secondary">PICK’EM</span></span></a>
          <span className="header-section">Playoffs</span>
          <span className="header-caption">ROCKET LEAGUE<span className="header-dot">·</span>MES PRONOSTICS</span>
        </div>
      </header>

      <main className="page" id="playoffs">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <div className="eyebrow event-label"><span className="event-indicator" />WORLD CHAMPIONSHIP</div>
            <h1 id="page-title">Playoffs<span className="title-tag">PRONOSTICS</span></h1>
            <p className="page-description">Cliquez sur une équipe pour la faire avancer. Le titre est entre vos mains.</p>
          </div>
          <div className="progress-summary" role="status" aria-live="polite" aria-atomic="true">
            <div><span><strong>{count.toString().padStart(2, '0')}</strong><span className="progress-total"> / {matches.length}</span></span><span className="progress-caption">{count === matches.length ? 'Bracket complété' : 'matchs pronostiqués'}</span></div>
            <progress max={matches.length} value={count} aria-label="Progression des pronostics" />
          </div>
        </section>

        <section className="bracket-panel" aria-label="Mes pronostics">
          <div className="bracket-toolbar">
            <div className="bracket-tab"><Icon name="bracket" size={16} /><span>Bracket des playoffs</span><span className="team-count">12 équipes</span></div>
            <button className="reset-button" type="button" disabled={count === 0} onClick={() => setResetOpen(true)}><Icon name="reset" size={13} /><span>Réinitialiser mes pronostics</span></button>
          </div>
          <PlayoffBracket bracket={bracket} onPick={pickWinner} />
          <div className="bracket-footer">
            <div className="legend" aria-label="Légende"><span><i className="legend-winner" />Votre vainqueur</span><span><i className="legend-loser" />Équipe éliminée du match</span><span><i className="legend-path" />Parcours du perdant</span></div>
            <span className={`save-status${!storageAvailable ? ' save-status--unavailable' : ''}`}><Icon name="save" size={13} />{storageAvailable ? 'Sauvegarde automatique' : 'Sauvegarde indisponible dans ce navigateur'}</span>
          </div>
        </section>
        <footer className="page-footer"><span>Vous pouvez modifier vos choix à tout moment.</span><span>Un bracket de fans, pour les fans.<span className="footer-dot">·</span>Non affilié à RLCS</span></footer>
      </main>
      <ResetDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { reset(); setResetOpen(false); }} />
    </>
  );
}
