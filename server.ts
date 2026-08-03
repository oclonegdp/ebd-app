import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { POST as aiRouteHandler } from './app/api/ai/route';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint adapter for Web Request/Response in /app/api/ai/route.ts
  const handleAiRequest = async (req: express.Request, res: express.Response) => {
    try {
      const url = `${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`;
      const webReq = new Request(url, {
        method: req.method,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });

      const webRes = await aiRouteHandler(webReq);
      const data = await webRes.json();
      res.status(webRes.status).json(data);
    } catch (err: any) {
      console.error('Erro na rota de IA do servidor:', err);
      res.status(500).json({ error: err?.message || 'Erro interno no servidor' });
    }
  };

  // Serve both /app/api/ai and /api/ai
  app.post('/app/api/ai', handleAiRequest);
  app.post('/api/ai', handleAiRequest);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
