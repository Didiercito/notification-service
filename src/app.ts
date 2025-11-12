import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { healthController } from './infracstructure/api/dependencies/dependencies';

const app: Application = express();

app.use(cors({origin: '*'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', healthController.handle);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found on Notification Service',
    path: _req.originalUrl,
  });
});

export default app;