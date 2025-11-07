import { DataSource } from 'typeorm';
import { databaseConfig } from './database.config';
import { EmailLogSchema } from '../database/schemas/email-log.schema';

export const AppDataSource = new DataSource({
  ...databaseConfig,
  type: 'postgres',
  entities: [
    EmailLogSchema,
  ],
  migrations: [], 
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database for Notification-Service connected successfully');
    }
  } catch (error) {
    console.error('❌ Error connecting to Notification-Service database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Notification-Service database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing Notification-Service database:', error);
    throw error;
  }
};