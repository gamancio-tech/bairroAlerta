import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import routes from './routes';
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Bairro Alerta API está online!',
    endpoints: {
      health: '/health',
      alerts: '/api/alerts',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

export default app;
