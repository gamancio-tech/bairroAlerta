import cors from 'cors';
import express, { Request, Response } from 'express';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '10kb' }));

app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Bairro Alerta API está online!',
    endpoints: {
      health: '/health',
      alerts: '/api/alerts',
    },
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
