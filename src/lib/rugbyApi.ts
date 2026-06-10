import { MatchPack, TeamStanding, Player, MatchRecord } from '../types';

const BASE = '/api/rugby';

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawStandingsTeam {
  team_name: string;
  position: string;
  matches_played: string;
  matches_won: string;
  matches_drawn: string;
  matches_lost: string;
  points_for: string;
  points_against: string;
  points_difference: string;
  tries_for: string;
  bonus_points: string;
  total_points: string;
  match_result?: { match: RawMatchResult | RawMatchResult[] };
}

interface RawMatchResult {
  id: string;
  teama_score: string;
  teamb_score: string;
}

interface RawStatEntry {
  player_name: string;
  team_short_name: string;
  team_full_name: string;
  value: string;
}

interface RawGFXPlayer {
  player_id: string;
  player_name: string;
  isPlaying: string;
  attacking: {
    tries: string;
    try_assists: string;
    defenders_beaten: string;
    line_breaks: string;
    offloads: string;
  };
  defence_discipline: {
    tackles: string;
    turnovers_won: string;
    yellow_cards: string;
    red_cards: string;
    handling_errors: string;
  };
  kicking: {
    conversions: string;
    penalty_goals: string;
  };
}

interface RawGFXTeam {
  team_name: string;
  short_name: string;
  score: string;
  is_home_team: boolean | string;
  stats: Record<string, string>;
  squad: RawGFXPlayer[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function num(s: string | undefined): number {
  return parseInt(s ?? '0') || 0;
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// Maps any API team name/short-code to the app's internal team ID (matches MOCK_TEAMS keys)
function resolveTeamId(shortName: string, fullName: string): string {
  const n = (fullName || shortName || '').toLowerCase();
  if (n.includes('chennai'))                            return 'CB';
  if (n.includes('delhi'))                              return 'DR';
  if (n.includes('hyderabad'))                          return 'HH';
  if (n.includes('bengaluru') || n.includes('bangalore')) return 'BB';
  if (n.includes('mumbai'))                             return 'MD';
  if (n.includes('kolkata') || n.includes('kalinga'))  return 'KBT';
  return shortName || 'UNK';
}

function asArray<T>(val: T | T[] | null | undefined): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

// ─── Standings parser ─────────────────────────────────────────────────────────

function parseStandings(raw: any): { standings: TeamStanding[]; completedMatchIds: Set<string> } {
  const groups = asArray(raw?.Standings?.groups);
  const rawTeams: RawStandingsTeam[] = [];
  const completedMatchIds = new Set<string>();

  for (const g of groups) {
    rawTeams.push(...asArray<RawStandingsTeam>(g?.teams?.team).filter(t => t?.team_name));
  }

  for (const t of rawTeams) {
    for (const m of asArray<RawMatchResult>(t.match_result?.match)) {
      if (m.id && m.teama_score && m.teamb_score && m.teama_score !== '-' && m.teamb_score !== '-') {
        completedMatchIds.add(m.id);
      }
    }
  }

  const standings: TeamStanding[] = rawTeams.map(t => ({
    rank:          num(t.position),
    teamId:        resolveTeamId('', t.team_name),
    teamName:      titleCase(t.team_name),
    played:        num(t.matches_played),
    wins:          num(t.matches_won),
    draws:         num(t.matches_drawn),
    losses:        num(t.matches_lost),
    scoreDiff:     num(t.points_difference),
    bonusPoints:   num(t.bonus_points),
    leaguePoints:  num(t.total_points),
    pointsScored:  num(t.points_for),
    tries:         num(t.tries_for),
    conversions:   0,
  }));

  return { standings, completedMatchIds };
}

// ─── Leaderboards parser ──────────────────────────────────────────────────────

function parseLeaderboards(raw: any) {
  const allStats: any[] = asArray(raw?.all_stats);

  const pick = (statId: string): RawStatEntry[] => {
    const cat = allStats.find(s => s.stat_id === statId && s.stat_type === 'p');
    return asArray<RawStatEntry>(cat?.data).filter(e => e.player_name);
  };

  const makePlayer = (e: RawStatEntry, key: string): Player => ({
    name:       e.player_name,
    nat:        '',
    team:       resolveTeamId(e.team_short_name, e.team_full_name),
    pts:        key === 'pts'       ? num(e.value) : 0,
    tries:      key === 'tries'     ? num(e.value) : 0,
    conv:       key === 'conv'      ? num(e.value) : undefined,
    turnovers:  key === 'turnovers' ? num(e.value) : undefined,
    linebreaks: key === 'linebreaks'? num(e.value) : undefined,
    offloads:   key === 'offloads'  ? num(e.value) : undefined,
    tackles:    key === 'tackles'   ? num(e.value) : undefined,
    assists:    key === 'assists'   ? num(e.value) : undefined,
  });

  return {
    points:      pick('4').map(e => makePlayer(e, 'pts')),
    tries:       pick('1').map(e => makePlayer(e, 'tries')),
    conversions: pick('2').map(e => makePlayer(e, 'conv')),
    // stat_id=3 is tackles; used as turnovers proxy until API exposes turnovers_won ranking
    turnovers:   pick('3').map(e => makePlayer(e, 'tackles')),
    // stat_id=7 is offloads; used as linebreaks proxy
    linebreaks:  pick('7').map(e => makePlayer(e, 'offloads')),
  };
}

// ─── GFX aggregator ───────────────────────────────────────────────────────────

type PlayerAcc = {
  name: string; teamId: string;
  pts: number; tries: number; conv: number; assists: number;
  tackles: number; offloads: number; linebreaks: number;
  defbeaten: number; turnovers: number; yc: number; rc: number; mp: number;
};

type TeamAcc = {
  conversions: number; assists: number; tackles: number; offloads: number;
  yellowCards: number; redCards: number; turnoversWon: number;
  scrumWon: number; scrumLost: number; lineoutWon: number; lineoutLost: number;
  handlingErrors: number;
};

function aggregateGFX(gfxList: any[], standings: TeamStanding[]): {
  players: Player[];
  discipline: MatchPack['discipline'];
  enrichedStandings: TeamStanding[];
  matches: MatchRecord[];
} {
  const playerMap: Record<string, PlayerAcc> = {};
  const teamMap:   Record<string, TeamAcc>   = {};
  const matches:   MatchRecord[]             = [];
  let matchCounter = 1;

  const initTeam = (id: string) => {
    if (!teamMap[id]) teamMap[id] = { conversions: 0, assists: 0, tackles: 0, offloads: 0, yellowCards: 0, redCards: 0, turnoversWon: 0, scrumWon: 0, scrumLost: 0, lineoutWon: 0, lineoutLost: 0, handlingErrors: 0 };
  };

  for (const gfx of gfxList) {
    if (!gfx) continue;

    // GFX API may return teams as array (gfx.teams) or wrapped object (gfx.teams.team)
    const teamsRaw: RawGFXTeam[] = Array.isArray(gfx.teams)
      ? gfx.teams
      : asArray(gfx.teams?.team ?? gfx.match_detail?.teams?.team);
    if (teamsRaw.length < 2) continue;

    const matchNo  = num(gfx.match_detail?.match_number) || matchCounter++;
    const homeRaw  = teamsRaw.find(t => t.is_home_team === true || t.is_home_team === 'true' || t.is_home_team === '1') ?? teamsRaw[0];
    const awayRaw  = teamsRaw.find(t => t !== homeRaw) ?? teamsRaw[1];
    // API uses either team_name or name
    const homeId   = resolveTeamId(homeRaw.short_name, (homeRaw as any).name ?? homeRaw.team_name);
    const awayId   = resolveTeamId(awayRaw.short_name, (awayRaw as any).name ?? awayRaw.team_name);
    const hPts     = num(homeRaw.score);
    const aPts     = num(awayRaw.score);
    const hT       = num(homeRaw.stats?.tries);
    const aT       = num(awayRaw.stats?.tries);

    let winner = 'Draw';
    if (hPts > aPts) winner = homeId;
    else if (aPts > hPts) winner = awayId;

    matches.push({ no: matchNo, home: homeId, hPts, hT, away: awayId, aPts, aT, win: winner, aggPts: hPts + aPts, notes: gfx.match_detail?.result?.matchresult });

    for (const team of teamsRaw) {
      const teamId = resolveTeamId(team.short_name, (team as any).name ?? team.team_name);
      initTeam(teamId);
      const ts = team.stats ?? {};
      teamMap[teamId].conversions   += num(ts.conversions);
      teamMap[teamId].assists       += num(ts.try_assists);
      teamMap[teamId].tackles       += num(ts.tackles);
      teamMap[teamId].offloads      += num(ts.offloads);
      teamMap[teamId].yellowCards   += num(ts.yellow_card);
      teamMap[teamId].redCards      += num(ts.red_card);
      teamMap[teamId].turnoversWon  += num(ts.turnovers_won);
      teamMap[teamId].scrumWon      += num(ts.scrums_won);
      teamMap[teamId].scrumLost     += num(ts.scrums_lost);
      teamMap[teamId].lineoutWon    += num(ts.lineouts_won);
      teamMap[teamId].lineoutLost   += num(ts.lineouts_lost);
      teamMap[teamId].handlingErrors += num(ts.handling_errors);

      for (const p of asArray<RawGFXPlayer>(team.squad)) {
        // API uses either player_name or name depending on endpoint version
        const playerName = p.player_name || (p as any).name;
        if (!playerName) continue;
        const pid = p.player_id || (p as any).id || playerName;
        if (!playerMap[pid]) {
          playerMap[pid] = { name: playerName, teamId, pts: 0, tries: 0, conv: 0, assists: 0, tackles: 0, offloads: 0, linebreaks: 0, defbeaten: 0, turnovers: 0, yc: 0, rc: 0, mp: 0 };
        }
        const acc  = playerMap[pid];
        const tries = num(p.attacking?.tries);
        const conv  = num(p.kicking?.conversions);
        const pens  = num(p.kicking?.penalty_goals);
        acc.tries      += tries;
        acc.conv       += conv;
        acc.pts        += tries * 5 + conv * 2 + pens * 3;
        acc.assists    += num(p.attacking?.try_assists);
        acc.offloads   += num(p.attacking?.offloads);
        acc.linebreaks += num(p.attacking?.line_breaks);
        acc.defbeaten  += num(p.attacking?.defenders_beaten);
        acc.tackles    += num(p.defence_discipline?.tackles);
        acc.turnovers  += num(p.defence_discipline?.turnovers_won);
        acc.yc         += num(p.defence_discipline?.yellow_cards);
        acc.rc         += num(p.defence_discipline?.red_cards);
        acc.mp         += 1;
      }
    }
  }

  matches.sort((a, b) => a.no - b.no);

  const players: Player[] = Object.values(playerMap)
    .map(p => ({
      name:       p.name,
      nat:        '',
      team:       p.teamId,
      pts:        p.pts,
      tries:      p.tries,
      conv:       p.conv   || undefined,
      assists:    p.assists || undefined,
      tackles:    p.tackles || undefined,
      offloads:   p.offloads || undefined,
      linebreaks: p.linebreaks || undefined,
      defbeaten:  p.defbeaten || undefined,
      turnovers:  p.turnovers || undefined,
      yc:         p.yc || undefined,
      rc:         p.rc || undefined,
      mp:         p.mp,
    }))
    .sort((a, b) => b.pts - a.pts);

  const yellowCardsByTeam = Object.entries(teamMap)
    .filter(([, v]) => v.yellowCards > 0)
    .sort(([, a], [, b]) => b.yellowCards - a.yellowCards)
    .map(([tid, v]) => ({ team: standings.find(s => s.teamId === tid)?.teamName ?? tid, count: v.yellowCards }));

  const topCarded = players
    .filter(p => (p.yc ?? 0) > 0 || (p.rc ?? 0) > 0)
    .sort((a, b) => ((b.yc ?? 0) + (b.rc ?? 0) * 2) - ((a.yc ?? 0) + (a.rc ?? 0) * 2))
    .slice(0, 5);

  const enrichedStandings = standings.map(s => ({
    ...s,
    conversions:    teamMap[s.teamId]?.conversions   ?? 0,
    assists:        teamMap[s.teamId]?.assists,
    tackles:        teamMap[s.teamId]?.tackles,
    offloads:       teamMap[s.teamId]?.offloads,
    yellowCards:    teamMap[s.teamId]?.yellowCards,
    redCards:       teamMap[s.teamId]?.redCards,
    turnoversWon:   teamMap[s.teamId]?.turnoversWon,
    scrumWon:       teamMap[s.teamId]?.scrumWon,
    scrumLost:      teamMap[s.teamId]?.scrumLost,
    lineoutWon:     teamMap[s.teamId]?.lineoutWon,
    lineoutLost:    teamMap[s.teamId]?.lineoutLost,
    handlingErrors: teamMap[s.teamId]?.handlingErrors,
  }));

  return { players, discipline: { yellowCards: yellowCardsByTeam, knockOns: [], topCarded }, enrichedStandings, matches };
}

// ─── Facts generator ──────────────────────────────────────────────────────────

function generateFacts(
  standings: TeamStanding[],
  lb: ReturnType<typeof parseLeaderboards>,
  matchCount: number
): MatchPack['facts'] {
  if (matchCount === 0 || standings.every(s => s.played === 0)) {
    return [{ value: 'Live', text: 'Season data will update in real-time as matches are played. Check back after the first fixture.' }];
  }

  const facts: MatchPack['facts'] = [];
  const sorted = [...standings].sort((a, b) => b.leaguePoints - a.leaguePoints);

  const top = sorted[0];
  if (top?.played > 0) facts.push({ value: top.pointsScored, text: `${top.teamName} lead the scoring charts with ${top.pointsScored} points from ${top.played} match${top.played > 1 ? 'es' : ''}.` });

  const topPts = lb.points[0];
  if (topPts?.pts > 0) facts.push({ value: topPts.pts, text: `${topPts.name} (${topPts.team}) is the top points scorer with ${topPts.pts} points this season.` });

  const topTry = lb.tries[0];
  if (topTry?.tries > 0) facts.push({ value: topTry.tries, text: `${topTry.name} (${topTry.team}) leads the try-scoring charts with ${topTry.tries} ${topTry.tries === 1 ? 'try' : 'tries'} so far.` });

  const totalTries = standings.reduce((s, t) => s + t.tries, 0);
  if (totalTries > 0) facts.push({ value: totalTries, text: `${totalTries} tries scored across ${matchCount} match${matchCount > 1 ? 'es' : ''} — a thrilling start to the competition.` });

  const totalPts = standings.reduce((s, t) => s + t.pointsScored, 0);
  if (matchCount > 0 && totalPts > 0) {
    const avg = (totalPts / matchCount / 2).toFixed(1);
    facts.push({ value: avg, text: `League average of ${avg} points per team per match across all completed fixtures.` });
  }

  return facts;
}

// ─── Merge StatsListing into player array ─────────────────────────────────────
// GFX per-match data sometimes lacks per-player tries/conversions (empty strings).
// StatsListing always has authoritative season totals. Merge them by player name.

function mergeLeaderboardsIntoPlayers(
  gfxPlayers: Player[],
  lb: ReturnType<typeof parseLeaderboards>
): Player[] {
  const byName = new Map<string, Player>(gfxPlayers.map(p => [p.name.toLowerCase(), p]));

  // Update a single field on an existing player or insert a new player.
  // NEVER recalculate pts here — lb.points is the authoritative total and
  // may include penalty goals which aren't separately tracked (pts = tries*5 + conv*2 + pens*3).
  const upsert = (entry: Player, field: keyof Player) => {
    const key = entry.name.toLowerCase();
    if (byName.has(key)) {
      (byName.get(key) as any)[field] = (entry as any)[field];
    } else {
      byName.set(key, { ...entry });
    }
  };

  // Apply in order: pts first so the authoritative total is set before anything else
  for (const p of lb.points)      upsert(p, 'pts');
  for (const p of lb.tries)       upsert(p, 'tries');
  for (const p of lb.conversions) upsert(p, 'conv');
  for (const p of lb.turnovers)   upsert(p, 'tackles');
  for (const p of lb.linebreaks)  upsert(p, 'offloads');

  return [...byName.values()].sort((a, b) => b.pts - a.pts);
}

// ─── Public builder ───────────────────────────────────────────────────────────

export async function buildLiveMatchPack(
  compid: number,
  label: string,
  competition: string
): Promise<{ pack: MatchPack; players: Player[] }> {
  const [standingsRaw, statsRaw] = await Promise.all([
    fetch(`${BASE}/standings/${compid}`).then(r => r.json()),
    fetch(`${BASE}/stats/${compid}`).then(r => r.json()),
  ]);

  const { standings, completedMatchIds } = parseStandings(standingsRaw);
  const leaderboards = parseLeaderboards(statsRaw);

  const gfxList = await Promise.all(
    Array.from(completedMatchIds).map(id =>
      fetch(`${BASE}/match/${id}`).then(r => r.json()).catch(() => null)
    )
  );

  const { players: gfxPlayers, discipline, enrichedStandings, matches } = aggregateGFX(gfxList.filter(Boolean), standings);

  // Merge authoritative StatsListing season totals into GFX players (GFX per-match
  // data sometimes leaves tries/conversions as empty strings for certain competitions)
  const players = mergeLeaderboardsIntoPlayers(gfxPlayers, leaderboards);

  // Replace API leaderboard proxies with GFX-accurate turnovers & linebreaks if available
  const gfxTurnovers  = [...players].filter(p => (p.turnovers  ?? 0) > 0).sort((a, b) => (b.turnovers  ?? 0) - (a.turnovers  ?? 0)).slice(0, 10);
  const gfxLinebreaks = [...players].filter(p => (p.linebreaks ?? 0) > 0).sort((a, b) => (b.linebreaks ?? 0) - (a.linebreaks ?? 0)).slice(0, 10);

  const facts = generateFacts(enrichedStandings, leaderboards, completedMatchIds.size);

  const pack: MatchPack = {
    id: `live-${compid}`,
    label,
    type: 'season',
    competition,
    facts,
    standings: enrichedStandings,
    leaderboards: {
      ...leaderboards,
      turnovers:  gfxTurnovers.length  > 0 ? gfxTurnovers  : leaderboards.turnovers,
      linebreaks: gfxLinebreaks.length > 0 ? gfxLinebreaks : leaderboards.linebreaks,
    },
    discipline,
    matches,
  };

  return { pack, players };
}
