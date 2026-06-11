import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const RUGBY_API = 'https://cloud.cricket-21.com/cricketapi/api/RugbyMatchCenter';

// Subfolder prefix, e.g. /rpl — set BASE_PATH env var when starting the server.
// Must match the VITE_BASE_PATH used at build time.
const BASE_PATH = (process.env.BASE_PATH || '/rpl').replace(/\/$/, '');

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Rugby live API proxy routes (avoids browser CORS restrictions)
  app.get(`${BASE_PATH}/api/rugby/standings/:compid`, async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/Standings?compid=${req.params.compid}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch standings' }); }
  });

  app.get(`${BASE_PATH}/api/rugby/stats/:compid`, async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/StatsListing?compid=${req.params.compid}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch stats' }); }
  });

  app.get(`${BASE_PATH}/api/rugby/match/:matchId`, async (req, res) => {
    try {
      const r = await fetch(`${RUGBY_API}/GFXApi?matchid=${req.params.matchId}&type=json`);
      res.json(await r.json());
    } catch { res.status(500).json({ error: 'Failed to fetch match' }); }
  });

  // Mock API routes
  app.get(`${BASE_PATH}/api/packs`, (req, res) => {
    res.json([{ id: 'rpl2025s1-full', name: 'Season 1 Full Pack' }]);
  });

  app.get(`${BASE_PATH}/api/export/:packId`, (req, res) => {
    res.json({ success: true, url: `/downloads/${req.params.packId}.pdf` });
  });

  if (process.env.NODE_ENV !== "production") {
    // Dev: Vite middleware handles HMR and asset serving
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve the built dist/ folder under BASE_PATH
    const distPath = path.join(process.cwd(), 'dist');
    app.use(BASE_PATH, express.static(distPath));
    // SPA fallback — all routes under BASE_PATH serve index.html
    app.get(`${BASE_PATH}/*`, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RPL Analytics Server running on http://localhost:${PORT}${BASE_PATH}`);
  });
}

startServer();
