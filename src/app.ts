import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { httpLogger } from './middlewares/logger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Routes imports
import authRouter from './routes/auth.routes';
import usersRouter from './routes/users.routes';
import categoriesRouter from './routes/categories.routes';
import incomesRouter from './routes/incomes.routes';
import expensesRouter from './routes/expenses.routes';
import dashboardRouter from './routes/dashboard.routes';
import reportsRouter from './routes/reports.routes';
import settingsRouter from './routes/settings.routes';
import movementsRouter from './routes/movements.routes';
import profileRouter from './routes/profile.routes';
import productsRouter from './routes/products.routes';
import profileImageRouter from './routes/profile-image.routes';
import imagesRouter from './routes/images.routes';

const app = express();

// Set trust proxy to enable express-rate-limit to get correct IP from headers (needed in Docker/reverse proxies)
app.set('trust proxy', 1);

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  }),
);
app.use(compression());

// Aumentamos el límite de JSON para soportar imágenes en Base64 (máx ~10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes de perfil, etc.)
const uploadsDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
app.use(`/${env.UPLOAD_DIR}`, express.static(uploadsDir));

// Servir archivos del Image Storage Bucket
const storageDir = path.resolve(process.cwd(), env.IMAGE_STORAGE_PATH);
app.use(`/storage/images`, express.static(storageDir));

app.use(httpLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests',
  },
});
app.use(limiter);

// API Documentation (Swagger)
if (env.SWAGGER_ENABLED) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`${env.API_PREFIX}/auth`, authRouter);
app.use(`${env.API_PREFIX}/users`, usersRouter);
app.use(`${env.API_PREFIX}/categories`, categoriesRouter);
app.use(`${env.API_PREFIX}/incomes`, incomesRouter);
app.use(`${env.API_PREFIX}/expenses`, expensesRouter);
app.use(`${env.API_PREFIX}/dashboard`, dashboardRouter);
app.use(`${env.API_PREFIX}/reports`, reportsRouter);
app.use(`${env.API_PREFIX}/settings`, settingsRouter);
app.use(`${env.API_PREFIX}/movements`, movementsRouter);
app.use(`${env.API_PREFIX}/profile`, profileRouter);
app.use(`${env.API_PREFIX}/profile-image`, profileImageRouter);
app.use(`${env.API_PREFIX}/images`, imagesRouter);
app.use(`${env.API_PREFIX}/products`, productsRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
