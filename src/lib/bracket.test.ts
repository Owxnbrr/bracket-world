import { describe, expect, it } from 'vitest';
import { matches } from '../data/bracket';
import { resolveBracket, selectWinner } from './bracket';
import { parsePredictions, serializePredictions } from './storage';
import type { Predictions } from '../types/bracket';

function picks(...choices: readonly (readonly [string, string])[]): Predictions {
  return choices.reduce<Predictions>((state, [match, team]) => selectWinner(state, match, team), {});
}

function completeBracket(): Predictions {
  return picks(['L1-A', 'twisted-minds'], ['L1-B', 'manchester-city'], ['L1-C', 'falcons'], ['L1-D', 'vitality'], ['L2-A', 'twisted-minds'], ['L2-B', 'falcons'], ['UQF-A', 'karmine-corp'], ['UQF-B', 'nrg'], ['LQF-A', 'virtus-pro'], ['LQF-B', 'falcons'], ['SF-A', 'karmine-corp'], ['SF-B', 'nrg'], ['GF', 'karmine-corp']);
}

describe('graphe des playoffs', () => {
  it('démarre avec 13 matchs et aucune sélection', () => {
    const state = resolveBracket({});
    expect(Object.keys(state.matches)).toHaveLength(13);
    expect(state.predictions).toEqual({});
    expect(state.matches.GF?.teams).toEqual([undefined, undefined]);
  });

  it('scénario 1 : Twisted Minds et Manchester City arrivent en L2-A', () => {
    const state = resolveBracket(picks(['L1-A', 'twisted-minds'], ['L1-B', 'manchester-city']));
    expect(state.matches['L2-A']?.teams.map((team) => team?.id)).toEqual(['twisted-minds', 'manchester-city']);
  });

  it('scénario 2 : le gagnant Upper va en SF et son perdant en Lower', () => {
    const state = resolveBracket(picks(['UQF-A', 'karmine-corp']));
    expect(state.matches['SF-A']?.teams[0]?.id).toBe('karmine-corp');
    expect(state.matches['LQF-A']?.teams[0]?.id).toBe('virtus-pro');
  });

  it('scénario 3 : VP gagne le Lower et retrouve KC en demi-finale', () => {
    const state = resolveBracket(picks(['UQF-A', 'karmine-corp'], ['LQF-A', 'virtus-pro']));
    expect(state.matches['SF-A']?.teams.map((team) => team?.id)).toEqual(['karmine-corp', 'virtus-pro']);
  });

  it('scénario 4 : changer KC pour VP efface les choix incompatibles jusqu’au champion', () => {
    const state = resolveBracket(selectWinner(completeBracket(), 'UQF-A', 'virtus-pro'));
    expect(state.matches['SF-A']?.teams.map((team) => team?.id)).toEqual(['virtus-pro', undefined]);
    expect(state.matches['LQF-A']?.teams[0]?.id).toBe('karmine-corp');
    expect(state.predictions['LQF-A']).toBeUndefined();
    expect(state.predictions['SF-A']).toBeUndefined();
    expect(state.predictions.GF).toBeUndefined();
    expect(state.matches.GF?.winner).toBeUndefined();
    expect(state.predictions['SF-B']?.winnerId).toBe('nrg');
  });

  it('scénario 5 : résout les 13 matchs jusqu’au champion', () => {
    const state = resolveBracket(completeBracket());
    expect(Object.keys(state.predictions)).toHaveLength(13);
    expect(state.matches.GF?.winner?.id).toBe('karmine-corp');
  });

  it('scénario 6 : la sauvegarde se restaure sans modification', () => {
    const original = completeBracket();
    expect(parsePredictions(serializePredictions(original))).toEqual(original);
  });

  it('scénario 7 : un état vide réinitialise toutes les phases', () => {
    const state = resolveBracket(parsePredictions(null));
    expect(Object.values(state.matches).every((match) => !match.winner)).toBe(true);
    expect(state.matches['LQF-A']?.teams).toEqual([undefined, undefined]);
  });

  it('conserve un choix encore valide lorsque seul son adversaire change', () => {
    const original = picks(['L1-A', 'twisted-minds'], ['L1-B', 'manchester-city'], ['L2-A', 'twisted-minds']);
    expect(selectWinner(original, 'L1-B', 'gentle-mates')['L2-A']?.winnerId).toBe('twisted-minds');
  });

  it('refuse une équipe absente du match et un match inexistant', () => {
    expect(selectWinner({}, 'L1-A', 'karmine-corp')).toEqual({});
    expect(selectWinner({}, 'missing', 'karmine-corp')).toEqual({});
  });

  it('ne dépend pas de l’ordre des données et ne modifie pas son entrée', () => {
    const original = Object.freeze(completeBracket());
    expect(resolveBracket(original, [...matches].reverse()).predictions).toEqual(original);
    expect(selectWinner(original, 'UQF-A', 'virtus-pro')).not.toEqual(original);
    expect(original.GF?.winnerId).toBe('karmine-corp');
  });

  it('détecte les cycles, les sources inconnues et les doublons', () => {
    const base = matches[0]!;
    expect(() => resolveBracket({}, [{ ...base, sources: [{ type: 'winner', matchId: base.id }, base.sources[1]] }])).toThrow('circulaire');
    expect(() => resolveBracket({}, [{ ...base, sources: [{ type: 'winner', matchId: 'missing' }, base.sources[1]] }])).toThrow('inconnu');
    expect(() => resolveBracket({}, [base, base])).toThrow('dupliqué');
  });

  it('ignore les sauvegardes corrompues et nettoie les résultats impossibles', () => {
    for (const raw of ['{', 'null', '[]', '{"version":2}', '{"version":1,"predictions":[]}']) expect(parsePredictions(raw)).toEqual({});
    expect(parsePredictions('{"version":1,"predictions":{"GF":{"winnerId":"karmine-corp"},"L1-A":{"winnerId":12},"unknown":{"winnerId":"nrg"}}}')).toEqual({});
  });

  it('garantit la cohérence après 2 000 modifications déterministes', () => {
    let predictions: Predictions = {};
    let seed = 912345;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
    for (let i = 0; i < 2000; i++) {
      const before = resolveBracket(predictions);
      const candidates = Object.values(before.matches).filter((match) => match.teams.some(Boolean));
      const selected = candidates[Math.floor(random() * candidates.length)]!;
      const participants = selected.teams.filter((team) => team !== undefined);
      predictions = selectWinner(predictions, selected.id, participants[Math.floor(random() * participants.length)]!.id);
      const after = resolveBracket(predictions);
      for (const match of Object.values(after.matches)) {
        if (match.winner) expect(match.teams.map((team) => team?.id)).toContain(match.winner.id);
        if (match.loser) expect(match.loser.id).not.toBe(match.winner?.id);
        for (const [index, source] of match.sources.entries()) {
          if (source.type !== 'team') expect(match.teams[index]?.id).toBe(after.matches[source.matchId]?.[source.type]?.id);
        }
      }
      expect(after.predictions).toEqual(predictions);
    }
  }, 15_000);
});
