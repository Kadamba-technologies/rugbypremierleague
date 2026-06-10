import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const RUGBY_API = 'https://cloud.cricket-21.com/cricketapi/api/RugbyMatchCenter';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Rugby live API proxy routes (avoids browser CORS restrictions)
  app.get('/api/rugby/standings/:compid', async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/Standings?compid=${req.params.compid}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch standings' }); }
  });

  app.get('/api/rugby/stats/:compid', async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/StatsListing?compid=${req.params.compid}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch stats' }); }
  });

  app.get('/api/rugby/match/:matchId', async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/GFXApi?matchid=${req.params.matchId}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch match' }); }
  });

  // Mock API: Fetch Match Packs
  app.get("/api/packs", (req, res) => {
    res.json([
      { id: 'rpl2025s1-full', name: 'Season 1 Full Pack' },
    ]);
  });

  // Mock API: Export Endpoint
  app.get("/api/export/:packId", (req, res) => {
    res.json({ success: true, url: `/downloads/${req.params.packId}.pdf` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Analytics Server running on http://localhost:${PORT}`);
  });
}

startServer();
