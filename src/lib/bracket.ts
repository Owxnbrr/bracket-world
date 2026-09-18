import { matches } from '../data/bracket';
import { teamsById } from '../data/teams';
import type { BracketState, Match, Prediction, Predictions, ResolvedMatch, TeamSource } from '../types/bracket';

/** Resolve dependencies before their consumers, independently of declaration order. */
export function resolveBracket(predictions: Predictions, definitions: readonly Match[] = matches): BracketState {
  const byId = new Map(definitions.map((match) => [match.id, match]));
  if (byId.size !== definitions.length) throw new Error('Identifiant de match dupliqué.');

  const resolved: Record<string, ResolvedMatch> = {};
  const valid: Record<string, Prediction> = {};
  const visiting = new Set<string>();

  function resolveSource(source: TeamSource) {
    if (source.type === 'team') {
      const team = teamsById[source.teamId];
      if (!team) throw new Error(`Équipe inconnue : ${source.teamId}`);
      return team;
    }
    return visit(source.matchId)[source.type];
  }

  function visit(id: string): ResolvedMatch {
    if (Object.hasOwn(resolved, id)) return resolved[id]!;
    const match = byId.get(id);
    if (!match) throw new Error(`Match source inconnu : ${id}`);
    if (visiting.has(id)) throw new Error(`Dépendance circulaire : ${id}`);
    visiting.add(id);

    const teams = [resolveSource(match.sources[0]), resolveSource(match.sources[1])] as const;
    const prediction = Object.hasOwn(predictions, id) ? predictions[id] : undefined;
    const winner = teams.find((team) => team !== undefined && team.id === prediction?.winnerId);
    const loser = winner ? teams.find((team) => team !== undefined && team.id !== winner.id) : undefined;

    // Keeping only reachable winners removes invalid choices all the way to the final.
    // A still-present team remains a valid pick if its opponent changes.
    if (winner) valid[id] = { winnerId: winner.id };
    const result: ResolvedMatch = { ...match, teams, winner, loser };
    resolved[id] = result;
    visiting.delete(id);
    return result;
  }

  definitions.forEach((match) => visit(match.id));
  return { matches: resolved, predictions: valid };
}

export function selectWinner(predictions: Predictions, matchId: string, teamId: string): Predictions {
  const current = resolveBracket(predictions);
  const match = current.matches[matchId];
  if (!match?.teams.some((team) => team?.id === teamId)) return current.predictions;
  return resolveBracket({ ...current.predictions, [matchId]: { winnerId: teamId } }).predictions;
}

export function sourceLabel(source: TeamSource): string {
  if (source.type === 'team') return teamsById[source.teamId]?.name ?? 'Équipe à déterminer';
  return `${source.type === 'winner' ? 'Vainqueur' : 'Perdant'} ${source.matchId}`;
}
