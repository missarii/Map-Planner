import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import serve from 'koa-static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import our subservers
import initialPageRouter from './subservers/InitialPage.js';
import mapPageRouter from './subservers/MapPage.js';

// Database initialization
import { getDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Koa();
const apiRouter = new Router({ prefix: '/api' });

// Setup middleware
app.use(cors());
app.use(bodyParser());

// Initialize Database connection on start to ensure tables exist
getDb().then(() => {
  console.log('SQLite database initialized successfully.');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// Register subservers' routes inside the /api namespace
apiRouter.use(initialPageRouter.routes(), initialPageRouter.allowedMethods());
apiRouter.use(mapPageRouter.routes(), mapPageRouter.allowedMethods());

app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

// Serve static React files in production mode
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || (isProd ? 3000 : 5000);

if (isProd) {
  const frontendDistPath = path.join(__dirname, '../frontend/dist');
  console.log(`Serving static files from: ${frontendDistPath}`);
  
  // Serve static assets
  app.use(serve(frontendDistPath));

  // Fallback for single page application routing (serve index.html)
  app.use(async (ctx, next) => {
    // If not API request and file is not found, serve index.html
    if (!ctx.path.startsWith('/api')) {
      const indexPath = path.join(frontendDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(indexPath);
        return;
      }
    }
    await next();
  });
} else {
  console.log('Running in Development mode. Backend server serves API endpoints on port 5000.');
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
