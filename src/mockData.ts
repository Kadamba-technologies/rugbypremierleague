import { MatchPack, Player, MatchRecord } from './types';

export const MOCK_TEAMS = {
  HH: { id: 'HH', name: 'Hyderabad Heroes', shortName: 'HH', logo: '/hyderabad_heroes.png' },
  CB: { id: 'CB', name: 'Chennai Bulls', shortName: 'CB', logo: '/chennai_bulls.png' },
  BB: { id: 'BB', name: 'Bengaluru Bravehearts', shortName: 'BB', logo: '/bengaluru_bravehearts.png' },
  KBT_S1: { id: 'Kalinga', name: 'Kalinga Black Tigers', shortName: 'KBT', logo: '/kalinga_black_tigers.png' },
  KBT_S2: { id: 'Kolkata', name: 'Kolkata Banga Tigers', shortName: 'KBT', logo: '/kolkata_banga_tigers.png' },
  DR: { id: 'DR', name: 'Delhi Redz', shortName: 'DR', logo: '/delhi_redz.png' },
  MD: { id: 'MD', name: 'Mumbai Dreamers', shortName: 'MD', logo: '/mumbai_dreamers.png' },
};

export const SEASON_1_PACK: MatchPack = {
  id: 'rpl2025s1-full',
  label: 'RPL Season 1 — Men',
  type: 'season',
  competition: 'Rugby Premier League 2025 — Season 1',
  facts: [
    { value: 314, text: "Hyderabad Heroes dominated the scoring in Season 1, finishing with 314 total points." },
    { value: 15, text: "Vaafauese Apelu Maliko (Chennai Bulls) lead the league with 15 tries in 12 matches." },
    { value: '69%', text: "Kalinga Black Tigers achieved the highest conversion success rate at 69%." },
    { value: 212, text: "Hyderabad Heroes' physical dominance was evident with a league-high 212 tackles made." },
    { value: 91, text: "Chennai Bulls showed elite flair with 91 offloads, the most by any team in S1." },
    { value: '26.2', text: "League average points per match for Season 1, showcasing a high-octane offensive environment." },
    { value: 19, text: "Akuila Rokolisoa (Bengaluru Bravehearts) created 19 offloads, showcasing elite creative link play." },
    { value: 32, text: "Filipe Sauturaga (Chennai Bulls) recorded a massive 32 tackles, the highest for any back-rower." },
    { value: 16, text: "Joji Nasova (Hyderabad Heroes) beat 16 defenders in just 11 matches, a league-leading strike rate." },
    { value: 7, text: "Vaafauese Apelu Maliko (Chennai Bulls) won 7 turnovers, the most for any winger in the league." },
  ],
  milestones: [
    { text: "Akuila Rokolisoa career points", target: "100 Points", current: 69, need: 31 },
    { text: "Chennai Bulls team tries", target: "50 Tries", current: 44, need: 6 },
    { text: "Hyderabad Heroes team points", target: "500 Points", current: 314, need: 186 },
    { text: "Terio Tamani career points", target: "100 Points", current: 66, need: 34 },
    { text: "Vaafauese Apelu Maliko career tries", target: "20 Tries", current: 15, need: 5 },
  ],
  standings: [
    { rank: 1, teamId: 'HH', teamName: 'Hyderabad Heroes', played: 12, wins: 10, draws: 0, losses: 2, scoreDiff: 169, bonusPoints: 8, leaguePoints: 48, pointsScored: 314, tries: 50, conversions: 32, assists: 38, tackles: 212, penaltyTries: 0, conversionsMissed: 18, offloads: 67, yellowCards: 4, redCards: 0, turnoversWon: 31, handlingErrors: 59, knockOns: 15, conversionSuccess: 64, scrumWon: 34, scrumLost: 8, lineoutWon: 11, lineoutLost: 3 },
    { rank: 2, teamId: 'CB', teamName: 'Chennai Bulls', played: 12, wins: 8, draws: 0, losses: 4, scoreDiff: 72, bonusPoints: 6, leaguePoints: 38, pointsScored: 276, tries: 44, conversions: 28, assists: 35, tackles: 202, penaltyTries: 0, conversionsMissed: 16, offloads: 91, yellowCards: 7, redCards: 0, turnoversWon: 30, handlingErrors: 62, knockOns: 14, conversionSuccess: 64, scrumWon: 53, scrumLost: 7, lineoutWon: 10, lineoutLost: 6 },
    { rank: 3, teamId: 'BB', teamName: 'Bengaluru Bravehearts', played: 12, wins: 6, draws: 1, losses: 5, scoreDiff: 15, bonusPoints: 5, leaguePoints: 31, pointsScored: 235, tries: 37, conversions: 25, assists: 29, tackles: 173, penaltyTries: 0, conversionsMissed: 12, offloads: 102, yellowCards: 4, redCards: 2, turnoversWon: 16, handlingErrors: 71, knockOns: 12, conversionSuccess: 68, scrumWon: 35, scrumLost: 9, lineoutWon: 7, lineoutLost: 8 },
    { rank: 4, teamId: 'KBT', teamName: 'Kalinga Black Tigers', played: 10, wins: 4, draws: 0, losses: 6, scoreDiff: -12, bonusPoints: 4, leaguePoints: 20, pointsScored: 185, tries: 29, conversions: 20, assists: 23, tackles: 142, penaltyTries: 0, conversionsMissed: 9, offloads: 38, yellowCards: 5, redCards: 0, turnoversWon: 16, handlingErrors: 55, knockOns: 18, conversionSuccess: 69, scrumWon: 18, scrumLost: 7, lineoutWon: 11, lineoutLost: 4 },
    { rank: 5, teamId: 'DR', teamName: 'Delhi Redz', played: 12, wins: 3, draws: 1, losses: 8, scoreDiff: -55, bonusPoints: 3, leaguePoints: 17, pointsScored: 172, tries: 26, conversions: 16, assists: 21, tackles: 167, penaltyTries: 1, conversionsMissed: 10, offloads: 68, yellowCards: 4, redCards: 0, turnoversWon: 19, handlingErrors: 74, knockOns: 17, conversionSuccess: 62, scrumWon: 45, scrumLost: 11, lineoutWon: 13, lineoutLost: 9 },
    { rank: 6, teamId: 'MD', teamName: 'Mumbai Dreamers', played: 10, wins: 2, draws: 0, losses: 8, scoreDiff: -89, bonusPoints: 2, leaguePoints: 10, pointsScored: 132, tries: 21, conversions: 10, assists: 17, tackles: 155, penaltyTries: 1, conversionsMissed: 11, offloads: 56, yellowCards: 2, redCards: 0, turnoversWon: 18, handlingErrors: 68, knockOns: 10, conversionSuccess: 48, scrumWon: 35, scrumLost: 12, lineoutWon: 4, lineoutLost: 5 },
  ],
  leaderboards: {
    points: [
      { name: 'Vaafauese Apelu Maliko', nat: 'SAM', team: 'CB', pts: 75, tries: 15 },
      { name: 'Akuila Rokolisoa', nat: 'NZL', team: 'BB', pts: 69, tries: 7 },
      { name: 'Terio Tamani', nat: 'FIJ', team: 'HH', pts: 66, tries: 6 },
      { name: 'Philip Wokorach', nat: 'UGA', team: 'BB', pts: 64, tries: 12 },
      { name: 'Joji Nasova', nat: 'FIJ', team: 'HH', pts: 52, tries: 10 },
      { name: 'Selvyn Davids', nat: 'RSA', team: 'HH', pts: 48, tries: 8 },
      { name: 'Perry Baker', nat: 'USA', team: 'DR', pts: 45, tries: 9 },
      { name: 'Javed Hussain', nat: 'IND', team: 'HH', pts: 40, tries: 8 },
      { name: 'P. Odongo Okongo', nat: 'KEN', team: 'DR', pts: 40, tries: 8 },
      { name: 'Maurice Longbottom', nat: 'AUS', team: 'KBT', pts: 38, tries: 2 },
    ],
    tries: [
      { name: 'Vaafauese Apelu Maliko', nat: 'SAM', team: 'CB', pts: 75, tries: 15 },
      { name: 'Philip Wokorach', nat: 'UGA', team: 'BB', pts: 64, tries: 12 },
      { name: 'Joji Nasova', nat: 'FIJ', team: 'HH', pts: 52, tries: 10 },
      { name: 'Perry Baker', nat: 'USA', team: 'DR', pts: 45, tries: 9 },
      { name: 'Javed Hussain', nat: 'IND', team: 'HH', pts: 40, tries: 8 },
      { name: 'Selvyn Davids', nat: 'RSA', team: 'HH', pts: 48, tries: 8 },
      { name: 'P. Odongo Okongo', nat: 'KEN', team: 'DR', pts: 40, tries: 8 },
      { name: 'Akuila Rokolisoa', nat: 'NZL', team: 'BB', pts: 69, tries: 7 },
      { name: 'Terio Tamani', nat: 'FIJ', team: 'HH', pts: 66, tries: 6 },
      { name: 'Terry Kennedy', nat: 'IRE', team: 'CB', pts: 30, tries: 6 },
    ],
    conversions: [
      { name: 'Terio Tamani', team: 'HH', nat: 'FIJ', pts: 66, tries: 6, conv: 18 },
      { name: 'Akuila Rokolisoa', team: 'BB', nat: 'NZL', pts: 69, tries: 7, conv: 17 },
      { name: 'Maurice Longbottom', team: 'KBT', nat: 'AUS', pts: 38, tries: 2, conv: 14 },
      { name: 'Filipe Sauturaga', team: 'CB', nat: 'FIJ', pts: 37, tries: 3, conv: 11 },
      { name: 'Madison Hughes', team: 'MD', nat: 'USA', pts: 36, tries: 4, conv: 8 },
      { name: 'Iowane Teba', team: 'BB', nat: 'FIJ', pts: 32, tries: 4, conv: 6 },
      { name: 'Deepak Punia', team: 'DR', nat: 'IND', pts: 18, tries: 1, conv: 5 },
      { name: 'Akash Balmiki', team: 'MD', nat: 'IND', pts: 15, tries: 1, conv: 5 },
      { name: 'Gaurav Kumar', team: 'CB', nat: 'IND', pts: 10, tries: 0, conv: 5 },
      { name: 'Selvyn Davids', team: 'HH', nat: 'RSA', pts: 48, tries: 8, conv: 4 },
    ],
    turnovers: [
      { name: 'Vaafauese Apelu Maliko', team: 'CB', nat: 'SAM', pts: 75, tries: 15, turnovers: 7 },
      { name: 'Terry Kennedy', team: 'CB', nat: 'IRE', pts: 30, tries: 6, turnovers: 6 },
      { name: 'Perry Baker', team: 'DR', nat: 'USA', pts: 45, tries: 9, turnovers: 5 },
      { name: 'Filipe Sauturaga', team: 'CB', nat: 'FIJ', pts: 37, tries: 3, turnovers: 4 },
      { name: 'Deepak Punia', team: 'DR', nat: 'IND', pts: 18, tries: 1, turnovers: 3 },
      { name: 'Selvyn Davids', team: 'HH', nat: 'RSA', pts: 48, tries: 8, turnovers: 3 },
      { name: 'Philip Wokorach', team: 'BB', nat: 'UGA', pts: 64, tries: 12, turnovers: 2 },
      { name: 'Joji Nasova', team: 'HH', nat: 'FIJ', pts: 52, tries: 10, turnovers: 2 },
      { name: 'Madison Hughes', team: 'MD', nat: 'USA', pts: 36, tries: 4, turnovers: 2 },
      { name: 'Maurice Longbottom', team: 'KBT', nat: 'AUS', pts: 38, tries: 2, turnovers: 2 },
    ],
    linebreaks: [
      { name: 'Vaafauese Apelu Maliko', nat: 'SAM', team: 'CB', pts: 75, tries: 15, linebreaks: 21 },
      { name: 'Perry Baker', nat: 'USA', team: 'DR', pts: 45, tries: 9, linebreaks: 18 },
      { name: 'Terry Kennedy', nat: 'IRE', team: 'CB', pts: 30, tries: 6, linebreaks: 15 },
      { name: 'Philip Wokorach', nat: 'UGA', team: 'BB', pts: 64, tries: 12, linebreaks: 14 },
      { name: 'Terio Tamani', nat: 'FIJ', team: 'HH', pts: 66, tries: 6, linebreaks: 13 },
      { name: 'Selvyn Davids', nat: 'RSA', team: 'HH', pts: 48, tries: 8, linebreaks: 12 },
      { name: 'Rosko Specman', nat: 'RSA', team: 'KBT', pts: 34, tries: 6, linebreaks: 11 },
      { name: 'Akuila Rokolisoa', nat: 'NZL', team: 'BB', pts: 69, tries: 7, linebreaks: 10 },
      { name: 'Joji Nasova', nat: 'FIJ', team: 'HH', pts: 52, tries: 10, linebreaks: 10 },
      { name: 'Dan Norton', nat: 'ENG', team: 'BB', pts: 31, tries: 5, linebreaks: 9 },
    ]
  },
  discipline: {
    yellowCards: [
      { team: 'Chennai Bulls', count: 7 },
      { team: 'Kalinga Black Tigers', count: 5 },
      { team: 'Hyderabad Heroes', count: 4 },
      { team: 'Bengaluru Bravehearts', count: 4 },
      { team: 'Delhi Redz', count: 4 },
    ],
    knockOns: [
      { team: 'Kalinga Black Tigers', count: 18 },
      { team: 'Delhi Redz', count: 17 },
      { team: 'Hyderabad Heroes', count: 15 },
    ],
    topCarded: [
      { name: 'Iowane Teba', nat: 'FIJ', team: 'BB', pts: 32, tries: 4, yc: 2, rc: 2 },
    ]
  }
};

export const SEASON_2_MEN_PACK: MatchPack = {
  id: 'rpl2025s2-men',
  label: 'RPL Season 2 — Men',
  type: 'season',
  competition: 'Rugby Premier League 2025 — Season 2 (Men)',
  facts: [
    { value: "Upcoming", text: "Season 2 is scheduled to begin in mid-2025. Stay tuned for live updates." },
  ],
  standings: [],
  leaderboards: {
    points: [],
    tries: [],
    conversions: [],
    turnovers: [],
    linebreaks: []
  },
  discipline: {
    yellowCards: [],
    knockOns: [],
    topCarded: []
  }
};

export const SEASON_2_WOMEN_PACK: MatchPack = {
  id: 'rpl2025s2-women',
  label: 'RPL Season 2 — Women',
  type: 'season',
  competition: 'Rugby Premier League 2025 — Season 2 (Women)',
  facts: [
    { value: "Upcoming", text: "Women's league inaugural season coming soon. Follow our socials for announcements." },
  ],
  standings: [],
  leaderboards: {
    points: [],
    tries: [],
    conversions: [],
    turnovers: [],
    linebreaks: []
  },
  discipline: {
    yellowCards: [],
    knockOns: [],
    topCarded: []
  }
};

export const ALL_PLAYERS: Player[] = [
  { name: 'Vaafauese Apelu Maliko', nat: 'SAM', team: 'CB', pts: 75, tries: 15, isIndian: false, seasons: [1], linebreaks: 21, defbeaten: 23, turnovers: 7, yc: 1, rc: 0, tackles: 27, offloads: 11, assists: 4 },
  { name: 'Akuila Rokolisoa', nat: 'NZL', team: 'BB', pts: 69, tries: 7, conv: 17, isIndian: false, seasons: [1], linebreaks: 10, defbeaten: 8, turnovers: 1, tackles: 15, offloads: 19, assists: 3 },
  { name: 'Terio Tamani', nat: 'FIJ', team: 'HH', pts: 66, tries: 6, conv: 18, isIndian: false, seasons: [1, 2], linebreaks: 13, defbeaten: 14, turnovers: 0, tackles: 11, offloads: 7, assists: 8 },
  { name: 'Philip Wokorach', nat: 'UGA', team: 'BB', pts: 64, tries: 12, conv: 2, isIndian: false, seasons: [1], linebreaks: 14, defbeaten: 25, turnovers: 2, tackles: 19, offloads: 17, assists: 5 },
  { name: 'Joji Nasova', nat: 'FIJ', team: 'HH', pts: 52, tries: 10, conv: 1, isIndian: false, seasons: [1], linebreaks: 10, defbeaten: 16, turnovers: 2, tackles: 14, offloads: 12, assists: 4 },
  { name: 'Selvyn Davids', nat: 'RSA', team: 'HH', pts: 48, tries: 8, conv: 4, isIndian: false, seasons: [1], linebreaks: 12, defbeaten: 14, turnovers: 3, tackles: 18, offloads: 10, assists: 6 },
  { name: 'Perry Baker', nat: 'USA', team: 'DR', pts: 45, tries: 9, conv: 0, isIndian: false, seasons: [1], linebreaks: 18, defbeaten: 20, turnovers: 5, tackles: 12, offloads: 6, assists: 2 },
  { name: 'Javed Hussain', nat: 'IND', team: 'HH', pts: 40, tries: 8, isIndian: true, seasons: [1, 2], linebreaks: 7, defbeaten: 9, turnovers: 0, tackles: 10, offloads: 3, assists: 4 },
  { name: 'P. Odongo Okongo', nat: 'KEN', team: 'DR', pts: 40, tries: 8, isIndian: false, seasons: [1], linebreaks: 9, defbeaten: 18, turnovers: 0, tackles: 18, offloads: 4, assists: 0 },
  { name: 'Maurice Longbottom', nat: 'AUS', team: 'KBT', pts: 38, tries: 2, conv: 14, isIndian: false, seasons: [1], linebreaks: 3, defbeaten: 6, turnovers: 2, tackles: 13, offloads: 3, assists: 7 },
  { name: 'Madison Hughes', nat: 'USA', team: 'MD', pts: 36, tries: 4, conv: 8, isIndian: false, seasons: [1], linebreaks: 5, defbeaten: 7, turnovers: 2, tackles: 15, offloads: 8, assists: 9 },
  { name: 'Rosko Specman', nat: 'RSA', team: 'KBT', pts: 34, tries: 6, conv: 2, isIndian: false, seasons: [1], linebreaks: 11, defbeaten: 13, turnovers: 1, tackles: 10, offloads: 12, assists: 4 },
  { name: 'Dan Norton', nat: 'ENG', team: 'BB', pts: 31, tries: 5, conv: 3, isIndian: false, seasons: [1], linebreaks: 9, defbeaten: 11, turnovers: 2, tackles: 8, offloads: 5, assists: 3 },
  { name: 'Terry Kennedy', nat: 'IRE', team: 'CB', pts: 30, tries: 6, conv: 0, isIndian: false, seasons: [1], linebreaks: 15, defbeaten: 17, turnovers: 6, tackles: 14, offloads: 9, assists: 5 },
  { name: 'Deepak Punia', nat: 'IND', team: 'DR', pts: 18, tries: 1, conv: 5, isIndian: true, seasons: [1], linebreaks: 2, defbeaten: 2, turnovers: 3, tackles: 11, offloads: 9, assists: 4 },
  { name: 'Akash Balmiki', nat: 'IND', team: 'MD', pts: 15, tries: 1, conv: 5, isIndian: true, seasons: [1], linebreaks: 1, defbeaten: 2, turnovers: 1, tackles: 4, offloads: 3, assists: 1 },
  { name: 'Neeraj Khatri', nat: 'IND', team: 'MD', pts: 5, tries: 0, isIndian: true, seasons: [1, 2], linebreaks: 0, defbeaten: 4, turnovers: 2, tackles: 14, offloads: 1, assists: 0 },
  { name: 'Iowane Teba', nat: 'FIJ', team: 'BB', pts: 32, tries: 4, conv: 6, isIndian: false, seasons: [1], yc: 2, rc: 2, tackles: 20, offloads: 15, assists: 5, linebreaks: 6, defbeaten: 11 },
  { name: 'Gaurav Kumar', nat: 'IND', team: 'CB', pts: 10, tries: 0, conv: 5, isIndian: true, seasons: [1], tackles: 3, offloads: 1, assists: 1 },
  { name: 'Filipe Sauturaga', nat: 'FIJ', team: 'CB', pts: 37, tries: 3, conv: 11, isIndian: false, seasons: [1], linebreaks: 6, defbeaten: 15, turnovers: 4, tackles: 32, offloads: 26, assists: 10 },
  { name: 'Stephen Tomasin', nat: 'USA', team: 'HH', pts: 28, tries: 4, conv: 4, isIndian: false, seasons: [1], linebreaks: 5, defbeaten: 12 },
  { name: 'Nick Malouf', nat: 'AUS', team: 'BB', pts: 22, tries: 4, conv: 1, isIndian: false, seasons: [1], linebreaks: 4, defbeaten: 8 },
  { name: 'Naveen Khatri', nat: 'IND', team: 'DR', pts: 15, tries: 3, isIndian: true, seasons: [1], linebreaks: 3, defbeaten: 5 },
  { name: 'Shiva Kumar', nat: 'IND', team: 'KBT', pts: 12, tries: 2, isIndian: true, seasons: [1], linebreaks: 2, defbeaten: 4 },
  { name: 'Prince Khatri', nat: 'IND', team: 'KBT', pts: 25, tries: 5, isIndian: true, seasons: [1, 2], linebreaks: 8, defbeaten: 10 },
  { name: 'Aaron Grandidier', nat: 'FRA', team: 'MD', pts: 35, tries: 7, isIndian: false, seasons: [1], linebreaks: 12, defbeaten: 14 },
  { name: 'V. Ravindra', nat: 'IND', team: 'HH', pts: 20, tries: 4, isIndian: true, seasons: [1], linebreaks: 4, defbeaten: 8 },
  { name: 'C. Muniraju', nat: 'IND', team: 'BB', pts: 18, tries: 3, conv: 1, isIndian: true, seasons: [1], linebreaks: 3, defbeaten: 7 },
  { name: 'Dinesh Kumar', nat: 'IND', team: 'BB', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 12 },
  { name: 'Ravi Teja', nat: 'IND', team: 'HH', pts: 10, tries: 2, isIndian: true, seasons: [1], offloads: 4 },
  { name: 'Sumit Bansal', nat: 'IND', team: 'DR', pts: 0, tries: 0, isIndian: true, seasons: [1], tackles: 15 },
  { name: 'Ajit Singh', nat: 'IND', team: 'CB', pts: 5, tries: 1, isIndian: true, seasons: [1], yc: 1 },
  { name: 'Pankaj Gulia', nat: 'IND', team: 'KBT', pts: 15, tries: 3, isIndian: true, seasons: [1], linebreaks: 4 },
  { name: 'Vijay Pawar', nat: 'IND', team: 'MD', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 8 },
  { name: 'Sandeep Narwal', nat: 'IND', team: 'HH', pts: 5, tries: 1, isIndian: true, seasons: [1, 2], tackles: 20 },
  { name: 'Hitesh Yadav', nat: 'IND', team: 'DR', pts: 10, tries: 2, isIndian: true, seasons: [1], defbeaten: 5 },
  { name: 'Kushal Dogra', nat: 'IND', team: 'BB', pts: 12, tries: 2, conv: 1, isIndian: true, seasons: [1], offloads: 5 },
  { name: 'Anshu Saharan', nat: 'IND', team: 'CB', pts: 15, tries: 3, isIndian: true, seasons: [1], tackles: 14 },
  { name: 'B. Karthik', nat: 'IND', team: 'HH', pts: 0, tries: 0, isIndian: true, seasons: [1], assists: 3 },
  { name: 'S. Goutham', nat: 'IND', team: 'HH', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 10 },
  { name: 'Manish Singh', nat: 'IND', team: 'BB', pts: 10, tries: 2, isIndian: true, seasons: [1], linebreaks: 3 },
  { name: 'Aman Sehrawat', nat: 'IND', team: 'DR', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 12 },
  { name: 'M. Senthil', nat: 'IND', team: 'CB', pts: 10, tries: 2, isIndian: true, seasons: [1], offloads: 2 },
  { name: 'Vikram Singh', nat: 'IND', team: 'MD', pts: 15, tries: 3, isIndian: true, seasons: [1], tackles: 9 },
  { name: 'T. Murthy', nat: 'IND', team: 'CB', pts: 5, tries: 1, isIndian: true, seasons: [1, 2], linebreaks: 2 },
  { name: 'Rahul Chaudhary', nat: 'IND', team: 'HH', pts: 20, tries: 4, isIndian: true, seasons: [1, 2], defbeaten: 11 },
  { name: 'Prashant Kumar', nat: 'IND', team: 'MD', pts: 0, tries: 0, isIndian: true, seasons: [1], conversionsMissed: 4 },
  { name: 'S. Harsha', nat: 'IND', team: 'MD', pts: 10, tries: 2, isIndian: true, seasons: [1], tackles: 15 },
  { name: 'Vimal Chandran', nat: 'IND', team: 'DR', pts: 5, tries: 1, isIndian: true, seasons: [1], linebreaks: 1 },
  { name: 'Amit Hooda', nat: 'IND', team: 'DR', pts: 15, tries: 3, isIndian: true, seasons: [1], tackles: 18 },
  { name: 'Sunil Kumar', nat: 'IND', team: 'KBT', pts: 10, tries: 2, isIndian: true, seasons: [1], offloads: 3 },
  { name: 'Praveen Kumar', nat: 'IND', team: 'KBT', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 12 },
  { name: 'Roushan Singh', nat: 'IND', team: 'KBT', pts: 5, tries: 1, isIndian: true, seasons: [1], yc: 1 },
  { name: 'Punit Singh', nat: 'IND', team: 'CB', pts: 0, tries: 0, isIndian: true, seasons: [1], assists: 2 },
  { name: 'M. Karuppasamy', nat: 'IND', team: 'CB', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 9 },
  { name: 'Saurabh Kumar', nat: 'IND', team: 'BB', pts: 10, tries: 2, isIndian: true, seasons: [1], offloads: 4 },
  { name: 'Naveen Kumar', nat: 'IND', team: 'MD', pts: 20, tries: 4, isIndian: true, seasons: [1, 2], linebreaks: 6 },
  { name: 'Roshan Singh', nat: 'IND', team: 'DR', pts: 5, tries: 1, isIndian: true, seasons: [1], tackles: 10 },
  { name: 'Anshu Sehrawat', nat: 'IND', team: 'BB', pts: 5, tries: 1, isIndian: true, seasons: [1], offloads: 1 },
  { name: 'Gopal Singh', nat: 'IND', team: 'HH', pts: 10, tries: 2, isIndian: true, seasons: [1], linebreaks: 2 },
  { name: 'Ajinkya Kapre', nat: 'IND', team: 'CB', pts: 15, tries: 3, isIndian: true, seasons: [1], tackles: 11 },
  { name: 'Mohit Goyat', nat: 'IND', team: 'HH', pts: 30, tries: 6, isIndian: true, seasons: [1, 2], linebreaks: 10 },
];

export const SEASON_1_MATCHES: MatchRecord[] = [
  { no: 1, home: 'BB', hPts: 21, hT: 3, away: 'DR', aPts: 21, aT: 3, win: 'Draw', aggPts: 42, notes: "Inaugural match ends in a tie" },
  { no: 2, home: 'CB', hPts: 24, hT: 4, away: 'MD', aPts: 5, aT: 1, win: 'CB', aggPts: 29 },
  { no: 3, home: 'HH', hPts: 24, hT: 4, away: 'KBT', aPts: 14, aT: 2, win: 'HH', aggPts: 38 },
  { no: 4, home: 'KBT', hPts: 10, hT: 2, away: 'BB', aPts: 35, aT: 5, win: 'BB', aggPts: 45 },
  { no: 5, home: 'MD', hPts: 17, hT: 3, away: 'CB', aPts: 31, aT: 5, win: 'CB', aggPts: 48, notes: "8 Tries in the match" },
  { no: 6, home: 'DR', hPts: 7, hT: 1, away: 'CB', aPts: 21, aT: 3, win: 'CB', aggPts: 28 },
  { no: 7, home: 'HH', hPts: 43, hT: 7, away: 'BB', aPts: 7, aT: 1, win: 'HH', aggPts: 50, notes: "Highest in a match by a team (43)" },
  { no: 8, home: 'CB', hPts: 26, hT: 4, away: 'KBT', aPts: 26, aT: 4, win: 'Draw', aggPts: 52 },
  { no: 9, home: 'MD', hPts: 7, hT: 1, away: 'DR', aPts: 20, aT: 3, win: 'DR', aggPts: 27 },
  { no: 10, home: 'BB', hPts: 12, hT: 2, away: 'MD', aPts: 7, aT: 1, win: 'BB', aggPts: 19 },
  { no: 11, home: 'KBT', hPts: 12, hT: 2, away: 'HH', aPts: 43, aT: 7, win: 'HH', aggPts: 55, notes: "HH consecutive 43 pts" },
  { no: 12, home: 'BB', hPts: 26, hT: 4, away: 'CB', aPts: 0, aT: 0, win: 'BB', aggPts: 26, notes: "CB failed to score" },
  { no: 13, home: 'KBT', hPts: 7, hT: 1, away: 'DR', aPts: 21, aT: 3, win: 'DR', aggPts: 28 },
  { no: 14, home: 'MD', hPts: 12, hT: 1, away: 'HH', aPts: 19, aT: 3, win: 'HH', aggPts: 31, notes: "1st Penalty Try - MD" },
  { no: 15, home: 'CB', hPts: 31, hT: 5, away: 'BB', aPts: 24, aT: 4, win: 'CB', aggPts: 55 },
  { no: 16, home: 'HH', hPts: 24, hT: 4, away: 'MD', aPts: 17, aT: 3, win: 'HH', aggPts: 41 },
  { no: 17, home: 'DR', hPts: 15, hT: 3, away: 'KBT', aPts: 19, aT: 3, win: 'KBT', aggPts: 34 },
  { no: 18, home: 'BB', hPts: 26, hT: 4, away: 'HH', aPts: 21, aT: 3, win: 'BB', aggPts: 47 },
  { no: 19, home: 'CB', hPts: 24, hT: 4, away: 'DR', aPts: 7, aT: 1, win: 'CB', aggPts: 31, notes: "Vaafauese Maliko - Hat-trick" },
  { no: 20, home: 'KBT', hPts: 17, hT: 3, away: 'MD', aPts: 17, aT: 3, win: 'Draw', aggPts: 34 },
  { no: 21, home: 'DR', hPts: 22, hT: 4, away: 'BB', aPts: 12, aT: 2, win: 'DR', aggPts: 34 },
  { no: 22, home: 'HH', hPts: 28, hT: 4, away: 'CB', aPts: 7, aT: 1, win: 'HH', aggPts: 35 },
  { no: 23, home: 'MD', hPts: 5, hT: 1, away: 'KBT', aPts: 33, aT: 5, win: 'KBT', aggPts: 38 },
  { no: 24, home: 'CB', hPts: 0, hT: 0, away: 'HH', aPts: 17, aT: 3, win: 'HH', aggPts: 17, notes: "CB failed to score 2nd time" },
  { no: 25, home: 'BB', hPts: 34, hT: 6, away: 'KBT', aPts: 26, aT: 4, win: 'BB', aggPts: 60, notes: "Most Tries Scored in a Match (10)" },
  { no: 26, home: 'DR', hPts: 19, hT: 3, away: 'MD', aPts: 19, aT: 3, win: 'Draw', aggPts: 38 },
  { no: 27, home: 'KBT', hPts: 21, hT: 3, away: 'CB', aPts: 40, aT: 6, win: 'CB', aggPts: 61, notes: "Highest Points agg match (61)" },
  { no: 28, home: 'HH', hPts: 40, hT: 6, away: 'DR', aPts: 19, aT: 3, win: 'HH', aggPts: 59 },
  { no: 29, home: 'DR', hPts: 7, hT: 0, away: 'HH', aPts: 31, aT: 5, win: 'HH', aggPts: 38, notes: "2nd Penalty Try - DR" },
  { no: 30, home: 'MD', hPts: 26, hT: 4, away: 'BB', aPts: 14, aT: 2, win: 'MD', aggPts: 40, notes: "Mumbai 1st Win" },
  { no: 31, home: 'CB', hPts: 31, hT: 5, away: 'BB', aPts: 12, aT: 2, win: 'CB', aggPts: 43, notes: "Semi Final 1" },
  { no: 32, home: 'HH', hPts: 7, hT: 1, away: 'DR', aPts: 14, aT: 2, win: 'DR', aggPts: 21, notes: "Semi Final 2" },
  { no: 33, home: 'BB', hPts: 12, hT: 2, away: 'HH', aPts: 17, aT: 3, win: 'HH', aggPts: 29, notes: "3rd Place Match" },
  { no: 34, home: 'CB', hPts: 41, hT: 7, away: 'DR', aPts: 0, aT: 0, win: 'CB', aggPts: 41, notes: "Final: Chennai win RPL S1" },
];

/**
 * Historical Data Store for Trend Analysis
 */
export const SEASON_STATS_HISTORY: Record<string, Record<string, Partial<Player>>> = {
  S1: {
    'Vaafauese Apelu Maliko': { pts: 75, tries: 15 },
    'Akuila Rokolisoa': { pts: 69, tries: 7 },
    'Terio Tamani': { pts: 66, tries: 6 },
    'Philip Wokorach': { pts: 64, tries: 12 },
    'Joji Nasova': { pts: 52, tries: 10 },
    'Javed Hussain': { pts: 40, tries: 8 },
    'Deepak Punia': { pts: 18, tries: 1 },
    'Akash Balmiki': { pts: 15, tries: 1 },
    'Neeraj Khatri': { pts: 0, tries: 0 }, // S1 baseline
  },
  S2: {
    'Terio Tamani': { pts: 55, tries: 5 },
    'Javed Hussain': { pts: 35, tries: 6 },
  }
};

export const SEASON_2026_PACK_PLACEHOLDER: MatchPack = {
  id: 'rpl2026-tbd',
  label: 'RPL Season 2026',
  type: 'season',
  competition: 'Rugby Premier League 2026',
  facts: [
    { value: 'June 2026', text: 'Season begins from 16-28 June 2026. Stay tuned for the draft and schedule reveal.' }
  ],
  standings: [],
  leaderboards: {
    points: [],
    tries: [],
    conversions: [],
    turnovers: [],
    linebreaks: []
  },
  discipline: {
    yellowCards: [],
    knockOns: [],
    topCarded: []
  }
};
