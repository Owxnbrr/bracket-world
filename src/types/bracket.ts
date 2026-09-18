export interface Team {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly logo: string;
}

export type TeamSource =
  | { readonly type: 'team'; readonly teamId: string }
  | { readonly type: 'winner' | 'loser'; readonly matchId: string };

export interface Match {
  readonly id: string;
  readonly round: string;
  readonly label: string;
  readonly sources: readonly [TeamSource, TeamSource];
}

// A score can be attached to a prediction later without changing the graph.
export interface Prediction {
  readonly winnerId: string;
  readonly score?: readonly [number, number];
}

export type Predictions = Readonly<Partial<Record<string, Prediction>>>;

export interface ResolvedMatch extends Match {
  readonly teams: readonly [Team | undefined, Team | undefined];
  readonly winner: Team | undefined;
  readonly loser: Team | undefined;
}

export interface BracketState {
  readonly matches: Readonly<Record<string, ResolvedMatch>>;
  readonly predictions: Predictions;
}

export interface Round {
  readonly id: string;
  readonly title: string;
  readonly column: number;
  readonly level: 'upper' | 'lower';
  readonly matches: readonly { readonly id: string; readonly slot: number }[];
}
