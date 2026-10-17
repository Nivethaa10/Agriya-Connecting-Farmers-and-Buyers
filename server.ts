import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, dbStatus, testAtlasConnection } from './server/db.ts';
import { seedInitialData } from './server/seed.ts';

import authRoutes from './server/routes/authRoutes.ts';
import farmerRoutes from './server/routes/farmerRoutes.ts';
import buyerRoutes from './server/routes/buyerRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import documentRoutes from './server/routes/documentRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import supportRoutes from './server/routes/supportRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Basic security and parsing middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory (restricted via API endpoints, but available for assets if needed)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/support', supportRoutes);

// Real-time Database Status and Atlas Diagnostic endpoint
app.get('/api/db-status', async (req, res) => {
  const shouldTest = req.query.test === 'true';
  if (shouldTest) {
    const liveTest = await testAtlasConnection();
    return res.json({
      success: liveTest.success,
      liveTest,
      currentStatus: dbStatus,
    });
  }
  res.json({
    success: true,
    status: dbStatus,
  });
});

// Health check endpoint with database diagnostics
app.get('/api/health', (_req, res) => {
  res.json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    platform: 'AGRIYA AgriTech Contract Farming Platform',
    database: {
      provider: dbStatus.provider,
      connected: dbStatus.connected,
      maskedUri: dbStatus.maskedUri,
      atlasAttempted: dbStatus.atlasAttempted,
      atlasConnected: dbStatus.atlasConnected,
      atlasError: dbStatus.atlasError,
      atlasErrorCode: dbStatus.atlasErrorCode,
      readWriteSuccess: dbStatus.readWriteSuccess,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
});

// Centralized error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`Unhandled application error (${err?.name || 'Error'}).`);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode < 500 ? err.message : 'An internal server error occurred.',
  });
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured before starting the server.');
    }

    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed initial admin & sample opportunities idempotently
    await seedInitialData();

    // 3. Vite development middleware vs Production static serving
    if (!isProd) {
      console.log('Mounting Vite dev server middleware in Express on port', PORT);
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      console.log('Serving production build from dist...');
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`  🌾 AGRIYA Platform Engine Live on http://localhost:${PORT}`);
      console.log(`  Environment: ${isProd ? 'Production' : 'Development'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'Error';
    console.error(`Fatal server boot error (${errorName}).`);
    process.exit(1);
  }
}

startServer();
