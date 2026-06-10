export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface Player {
  name: string;
  nat: string;
  team: string;
  mp?: number;
  pts: number;
  tries: number;
  conv?: number;
  assists?: number;
  tackles?: number;
  offloads?: number;
  linebreaks?: number;
  defbeaten?: number;
  turnovers?: number;
  yc?: number;
  rc?: number;
  isIndian?: boolean;
  seasons?: number[];
  conversionsMissed?: number;
  handlingErrors?: number;
  knockOns?: number;
  penaltyTries?: number;
}

export interface Fact {
  value: string | number;
  text: string;
}

export interface TeamStanding {
  rank: number;
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scoreDiff: number;
  bonusPoints: number;
  leaguePoints: number;
  pointsScored: number;
  tries: number;
  conversions: number;
  assists?: number;
  tackles?: number;
  penaltyTries?: number;
  conversionsMissed?: number;
  offloads?: number;
  yellowCards?: number;
  redCards?: number;
  turnoversWon?: number;
  handlingErrors?: number;
  knockOns?: number;
  conversionSuccess?: number;
  scrumWon?: number;
  scrumLost?: number;
  lineoutWon?: number;
  lineoutLost?: number;
}

export interface MatchRecord {
  no: number;
  home: string;
  hPts: number;
  hT: number;
  away: string;
  aPts: number;
  aT: number;
  win: string;
  aggPts: number;
  notes?: string;
}

export interface MatchPack {
  id: string;
  label: string;
  type: 'match' | 'season' | 'upcoming';
  competition: string;
  homeTeam?: string;
  awayTeam?: string;
  date?: string;
  facts: Fact[];
  milestones?: { text: string; target: string; current: number; need: number }[];
  standings: TeamStanding[];
  leaderboards: {
    points: Player[];
    tries: Player[];
    conversions: Player[];
    turnovers: Player[];
    linebreaks: Player[];
  };
  discipline: {
    yellowCards: { team: string; count: number }[];
    knockOns: { team: string; count: number }[];
    topCarded: Player[];
  };
  matches?: MatchRecord[];
}
