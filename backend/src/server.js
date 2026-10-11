import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const requiredEnv = ['JWT_SECRET'];
for (const envVar of requiredEnv) {
  if (!process.env[envVar] && process.env.NODE_ENV !== 'test') {
    console.warn(`[Warning] Missing environment variable: ${envVar}. Backend operations may fail.`);
  }
}

const app = express();

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    databaseHost: mongoose.connection.host || 'disconnected',
    databaseName: mongoose.connection.name || 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain && process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[ReviewHub Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      });
    })
    .catch((err) => {
      console.error(`[Server Initialization Error] ${err.message}`);
    });
}

export default app;
