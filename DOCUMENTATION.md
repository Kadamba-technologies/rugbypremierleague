# Rugby Premier League (RPL) Analytics Dashboard Documentation

This document outlines the architecture, significance of each section, and the API requirements for the RPL Analytics Dashboard.

## Application Overview

The RPL Analytics Dashboard is a professional-grade broadcast and analytics tool designed to provide deep insights into the Rugby Premier League. It supports multiple seasons (men's and women's) and provides historical and real-time performance tracking for teams and players.

---

## Navigation & Tab Significance

### Home / Season Selection Screen
- **Significance:** The primary entry point for the application.
- **Content:** 
  - **Competition/Season Selector:** Allows users to switch between Season 1, Season 2 (Men/Women), and future Season 2026 data.
  - **Pack Type Selector:** Options for "Full Season Analytics" (currently implemented) or "Single Match" (planned).
- **Usage:** Bootstraps the application with specific tournament data.

### 1. Kadamba Facts (Dashboard)
- **Significance:** Provides a quick "at-a-glance" overview of the current season.
- **Content:** 
  - **Key Insights:** Cards highlighting league-wide narratives (e.g., "Season Total Points", "Average Points per Match").
  - **Upcoming Milestones:** Progress bars for specific performance targets (e.g., "Most Tries in Season").
- **Usage:** Quick reference for broadcasters to find interesting performance benchmarks.

### 2. League Table
- **Significance:** Shows the official competitive standings.
- **Content:** Table with Rank, Team, Matches Played (MP), Win-Draw-Loss (W-D-L), Score Difference (SD), Bonus Points (BP), League Points (PT), Points Scored (PTS), Tries (T), and Conversions (CONV).
- **Usage:** Tracking the promotion/relegation and playoff race.

### 3. Season Trends
- **Significance:** Advanced performance analysis over time.
- **Content:** 
  - **Performance Benchmarks:** Highest/lowest scores and aggregate records.
  - **Radar Charts:** Multi-dimensional comparison of Team/Player strengths.
  - **Match Momentum:** Line charts showing point accumulation per match.
- **Usage:** Scientific audit of how teams evolve during the season.

### 4. Team Performance
- **Significance:** Comparative team-to-team analysis.
- **Content:** Multi-team selection allows side-by-side metric comparison (Points, Tries, Conversions, Tackles, Offloads, Cards).
- **Usage:** Preparation for upcoming match-ups and identifying team weaknesses.

### 5. Leaderboards
- **Significance:** Recognition of top individual performers.
- **Content:** Top 10 rankings for Points, Tries, Conversions, Turnovers Won, and Line Breaks.
- **Usage:** Identifying the most influential players in the league.

### 7. Player Profiles
- **Significance:** Comprehensive player database tool.
- **Content:** 
  - **Search & Filters:** Filter by team, nationality (Indian vs Overseas), and season participation.
  - **View Modes:** Toggle between detailed "Card View" and sortable "List View".
- **Usage:** Detailed research into specific player statistics.

### 8. Key Match-ups
- **Significance:** Side-by-side player battle simulator.
- **Content:** User selects two players to compare their all key performance metrics in a split-screen layout.
- **Usage:** Building narratives for "star vs star" rivalries.

### 9. Discipline
- **Significance:** Monitoring foul play and fairness.
- **Content:** Team-wise yellow card distribution and a "Required Inquiry" section for players with high card counts.
- **Usage:** Tracking disciplinary trends and player conduct.

---

## API Requirements

To move from mock data to a dynamic backend, the following endpoints should be implemented:

### 1. `GET /api/packs`
- **Description:** Returns a list of available data packs (seasons/competitions).
- **Endpoint:** `/api/packs`
- **Payload:** `Array<{ id: string, label: string, type: 'season' | 'match' }>`

### 2. `GET /api/packs/:id`
- **Description:** Fetches the full data structure for a specific season.
- **Endpoint:** `/api/packs/s1`
- **Payload:** `MatchPack` object containing all facts, standings, leaderboards, and discipline data.

### 3. `GET /api/players`
- **Description:** Returns the complete database of players.
- **Endpoint:** `/api/players`
- **Query Params:** `?season=1&team=HH&type=indian`
- **Payload:** `Array<Player>`

### 4. `GET /api/teams`
- **Description:** Returns metadata for all teams (names, IDs, logos).
- **Endpoint:** `/api/teams`
- **Payload:** `Record<string, Team>`

### 5. `GET /api/matches`
- **Description:** Returns match-by-match results for trend calculation (Match Momentum).
- **Endpoint:** `/api/matches`
- **Payload:** `Array<{ no: number, home: string, away: string, hPts: number, aPts: number }>`

---

## API Integration Blueprint

This section provides a technical roadmap for building the backend services that will power the dashboard.

### 1. Global Infrastructure
- **Base URL:** `https://api.rpl-analytics.com/v1`
- **Protocol:** HTTPS (TLS 1.3)
- **Data Format:** JSON

### 2. Common API Headers
All requests to the RPL API should include the following headers to ensure security, versioning, and optimal data delivery.

| Header | Value / Example | Significance |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT_TOKEN>` | Standard OAuth2/JWT token for session management. |
| `X-API-Key` | `rpl_live_xxxxxxxx` | Public signature identifying the application instance. |
| `Content-Type` | `application/json` | Ensures payload parsing as JSON. |
| `Accept-Language` | `en-US` | Allows for localized fact generation (planned). |
| `X-Request-ID` | `req_550e8400` | Traceability ID for debugging backend logs. |
| `Cache-Control` | `max-age=60` | Directs client/CDN caching behavior for match data. |

### 3. Global Response Envelope
To maintain consistency across the app, all API responses should follow this structure:

```json
{
  "status": "success",
  "data": { ... },
  "metadata": {
    "requestId": "req_...",
    "timestamp": "2026-05-19T07:25:00Z",
    "version": "1.2.0"
  },
  "pagination": {
    "total": 120,
    "current": 1,
    "limit": 20
  }
}
```

### 4. Sample API Endpoints & Payload Design

#### A. Fetch Competitions (Packs)
**Method:** `GET`  
**Path:** `/competitions`  
**Description:** Fetches available seasons and match-specific analytics packs.

```json
{
  "data": [
    {
      "id": "s1",
      "label": "Season 1 (2024)",
      "type": "season",
      "status": "completed"
    },
    {
      "id": "s2_men",
      "label": "Season 2: Men's",
      "type": "season",
      "status": "live"
    }
  ]
}
```

#### B. Fetch Season Analytics (The "MatchPack")
**Method:** `GET`  
**Path:** `/competitions/{id}/analytics`  
**Description:** Returns the complete 360-degree data required for the "Season Trends" and "Facts" tabs.

**Request Sample:** `GET /v1/competitions/s1/analytics`

**Sample Payload:**
```json
{
  "data": {
    "id": "s1",
    "facts": [
      { "value": "1,240", "text": "Total Points Scored" },
      { "value": "18.5", "text": "Avg Tries Per Round" }
    ],
    "standings": [
      { "rank": 1, "teamName": "Chennai Bulls", "pointsScored": 345, "tries": 65 }
    ]
  }
}
```

#### C. Player Database with Advanced Filtering
**Method:** `GET`  
**Path:** `/players`  
**Description:** Powers the "Player Profiles" and "Key Match-ups" tools.

**Sample Request:** `GET /v1/players?nationality=indian&team=HH&sort=pts:desc`

**Sample Payload:**
```json
{
  "data": [
    {
      "name": "Javed Hussain",
      "team": "HH",
      "isIndian": true,
      "stats": {
        "pts": 40,
        "tries": 8,
        "tackles": 15
      }
    }
  ]
}
```

#### D. Match Momentum Data
**Method:** `GET`  
**Path:** `/competitions/{id}/momentum`  
**Description:** Specifically designed for the multi-series line charts in Season Trends.

```json
{
  "data": [
    { "match": 1, "scores": { "HH": 24, "CB": 17, "BB": 12 } },
    { "match": 2, "scores": { "HH": 52, "CB": 39, "BB": 27 } }
  ]
}
```

---

## Documentation Summary
The application is built as a single-entry React application (`App.tsx`) that manages state globally. Data is passed down to sub-sections as a `MatchPack`. All styling is handled via **Tailwind CSS**, and charts are rendered using **Recharts**.
