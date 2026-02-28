import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const INITIAL_SERVERS = [
    { id: 'ao-lua', name: 'Angola (Luanda)', flag: '🇦🇴', lat: -8.8390, lng: 13.2894, latency: 35, load: 15 },
    { id: 'na-win', name: 'Namibia (Windhoek)', flag: '🇳🇦', lat: -22.5745, lng: 17.0808, latency: 70, load: 25 },
    { id: 'za-cpt', name: 'South Africa (Cape Town)', flag: '🇿🇦', lat: -33.9249, lng: 18.4241, latency: 55, load: 30 },
    { id: 'ng-lag', name: 'Nigeria (Lagos)', flag: '🇳🇬', lat: 6.5244, lng: 3.3792, latency: 65, load: 45 },
    { id: 'ke-nbo', name: 'Kenya (Nairobi)', flag: '🇰🇪', lat: -1.2921, lng: 36.8219, latency: 80, load: 20 },
    { id: 'pt-lis', name: 'Portugal (Lisbon)', flag: '🇵🇹', lat: 38.7223, lng: -9.1393, latency: 110, load: 35 },
    { id: 'us-east', name: 'USA (New York)', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, latency: 145, load: 65 },
    { id: 'us-west', name: 'USA (Los Angeles)', flag: '🇺🇸', lat: 34.0522, lng: -118.2437, latency: 180, load: 50 },
    { id: 'br-sao', name: 'Brazil (São Paulo)', flag: '🇧🇷', lat: -23.5505, lng: -46.6333, latency: 160, load: 20 },
    { id: 'uk-lon', name: 'UK (London)', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, latency: 120, load: 40 },
    { id: 'de-fra', name: 'Germany (Frankfurt)', flag: '🇩🇪', lat: 50.1109, lng: 8.6821, latency: 115, load: 30 },
    { id: 'fr-par', name: 'France (Paris)', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, latency: 118, load: 45 },
    { id: 'jp-tok', name: 'Japan (Tokyo)', flag: '🇯🇵', lat: 35.6762, lng: 139.6503, latency: 250, load: 85 },
    { id: 'sg-sin', name: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198, latency: 210, load: 55 },
    { id: 'au-syd', name: 'Australia (Sydney)', flag: '🇦🇺', lat: -33.8688, lng: 151.2093, latency: 300, load: 40 },
    { id: 'in-mum', name: 'India (Mumbai)', flag: '🇮🇳', lat: 19.0760, lng: 72.8777, latency: 190, load: 60 },
    { id: 'ae-dxb', name: 'UAE (Dubai)', flag: '🇦🇪', lat: 25.2048, lng: 55.2708, latency: 150, load: 35 },
    { id: 'pl-war', name: 'Poland (Warsaw)', flag: '🇵🇱', lat: 52.2297, lng: 21.0122, latency: 125, load: 20 },
    { id: 'pl-kra', name: 'Poland (Kraków)', flag: '🇵🇱', lat: 50.0647, lng: 19.9450, latency: 130, load: 15 },
    { id: 'pl-gda', name: 'Poland (Gdańsk)', flag: '🇵🇱', lat: 54.3520, lng: 18.6466, latency: 128, load: 10 },
    { id: 'pl-poz', name: 'Poland (Poznań)', flag: '🇵🇱', lat: 52.4064, lng: 16.9252, latency: 132, load: 12 },
  ];

  app.get("/api/servers", (req, res) => {
    res.json(INITIAL_SERVERS);
  });

  // Mock server status data
  app.get("/api/status", (req, res) => {
    res.json({
      connected: true,
      server: INITIAL_SERVERS[0],
      ip: "185.12.44.201",
      location: "Luanda, Angola",
      uptime: "02:15:44",
      protocol: "WireGuard (UDP)",
      encryption: "AES-256-GCM"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BRC Conectar Server running on http://localhost:${PORT}`);
  });
}

startServer();
