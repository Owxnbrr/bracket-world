import type { Team } from '../types/bracket';

export const teams: readonly Team[] = [
  { id: 'twisted-minds', name: 'Twisted Minds', shortName: 'TM', logo: '/logos/twisted-minds.png' },
  { id: 'spacestation', name: 'Spacestation Gaming', shortName: 'SSG', logo: '/logos/spacestation.png' },
  { id: 'manchester-city', name: 'Manchester City', shortName: 'MCI', logo: '/logos/manchester-city.png' },
  { id: 'gentle-mates', name: 'Gentle Mates', shortName: 'M8', logo: '/logos/gentle-mates.png' },
  { id: 'falcons', name: 'Team Falcons', shortName: 'FLC', logo: '/logos/falcons.png' },
  { id: 'furia', name: 'FURIA', shortName: 'FUR', logo: '/logos/furia.png' },
  { id: 'shopify-rebellion', name: 'Shopify Rebellion', shortName: 'SR', logo: '/logos/shopify-rebellion.png' },
  { id: 'vitality', name: 'Team Vitality', shortName: 'VIT', logo: '/logos/vitality.png' },
  { id: 'karmine-corp', name: 'Karmine Corp', shortName: 'KC', logo: '/logos/karmine-corp.png' },
  { id: 'virtus-pro', name: 'Virtus.pro', shortName: 'VP', logo: '/logos/virtus-pro.png' },
  { id: 'fut', name: 'FUT Esports', shortName: 'FUT', logo: '/logos/fut.png' },
  { id: 'nrg', name: 'NRG', shortName: 'NRG', logo: '/logos/nrg.png' },
];

export const teamsById: Readonly<Record<string, Team>> = Object.fromEntries(
  teams.map((team) => [team.id, team]),
);
