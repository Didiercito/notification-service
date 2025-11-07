import { Response } from 'express';

export class HealthController {

  public handle = ( res: Response): void => {
    try {
      res.status(200).json({
        success: true,
        service: 'Notification Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        service: 'Notification Service',
        status: 'unhealthy',
        error: (error as Error).message,
      });
    }
  };
}