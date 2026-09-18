import type { Match, Round, TeamSource } from '../types/bracket';

const team = (teamId: string): TeamSource => ({ type: 'team', teamId });
const winner = (matchId: string): TeamSource => ({ type: 'winner', matchId });
const loser = (matchId: string): TeamSource => ({ type: 'loser', matchId });

export const matches: readonly Match[] = [
  { id: 'L1-A', round: 'lower-1', label: 'L1-A', sources: [team('twisted-minds'), team('spacestation')] },
  { id: 'L1-B', round: 'lower-1', label: 'L1-B', sources: [team('manchester-city'), team('gentle-mates')] },
  { id: 'L1-C', round: 'lower-1', label: 'L1-C', sources: [team('falcons'), team('furia')] },
  { id: 'L1-D', round: 'lower-1', label: 'L1-D', sources: [team('shopify-rebellion'), team('vitality')] },
  { id: 'L2-A', round: 'lower-2', label: 'L2-A', sources: [winner('L1-A'), winner('L1-B')] },
  { id: 'L2-B', round: 'lower-2', label: 'L2-B', sources: [winner('L1-C'), winner('L1-D')] },
  { id: 'UQF-A', round: 'upper-qf', label: 'UQF-A', sources: [team('karmine-corp'), team('virtus-pro')] },
  { id: 'UQF-B', round: 'upper-qf', label: 'UQF-B', sources: [team('fut'), team('nrg')] },
  { id: 'LQF-A', round: 'lower-qf', label: 'LQF-A', sources: [loser('UQF-A'), winner('L2-A')] },
  { id: 'LQF-B', round: 'lower-qf', label: 'LQF-B', sources: [loser('UQF-B'), winner('L2-B')] },
  { id: 'SF-A', round: 'semifinals', label: 'Semifinal A', sources: [winner('UQF-A'), winner('LQF-A')] },
  { id: 'SF-B', round: 'semifinals', label: 'Semifinal B', sources: [winner('UQF-B'), winner('LQF-B')] },
  { id: 'GF', round: 'final', label: 'Grand Final', sources: [winner('SF-A'), winner('SF-B')] },
];

// Slots are multiples of half the distance between two first-round matches.
// CSS places the cards; SVG measures those cards rather than duplicating coordinates.
export const rounds: readonly Round[] = [
  { id: 'lower-1', title: 'Lower Bracket Round 1', column: 1, level: 'lower', matches: [{ id: 'L1-A', slot: 0 }, { id: 'L1-B', slot: 2 }, { id: 'L1-C', slot: 4 }, { id: 'L1-D', slot: 6 }] },
  { id: 'lower-2', title: 'Lower Bracket Round 2', column: 2, level: 'lower', matches: [{ id: 'L2-A', slot: 1 }, { id: 'L2-B', slot: 5 }] },
  { id: 'upper-qf', title: 'Upper Bracket Quarterfinals', column: 3, level: 'upper', matches: [{ id: 'UQF-A', slot: 0 }, { id: 'UQF-B', slot: 2 }] },
  { id: 'lower-qf', title: 'Lower Bracket Quarterfinals', column: 3, level: 'lower', matches: [{ id: 'LQF-A', slot: 1 }, { id: 'LQF-B', slot: 5 }] },
  { id: 'semifinals', title: 'Semifinals', column: 4, level: 'lower', matches: [{ id: 'SF-A', slot: 1 }, { id: 'SF-B', slot: 5 }] },
  { id: 'final', title: 'Grand Final', column: 5, level: 'lower', matches: [{ id: 'GF', slot: 3 }] },
];
