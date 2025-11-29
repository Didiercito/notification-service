import app from './app';
import { config } from 'dotenv';
import { initializeDatabase, closeDatabase } from './config/data-source';
import { rabbitMqConsumer } from './infracstructure/api/dependencies/dependencies';

config();

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    console.log('🚀 Starting Notification Service...');
    console.log('📦 Connecting to database...');
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // console.log('📨 Connecting to RabbitMQ and starting consumer...');
    // await rabbitMqConsumer.startConsuming(); 
    // console.log('✅ RabbitMQ consumer started successfully');

    app.listen(PORT, () => {
      console.log('🚀═══════════════════════════════════════════════🚀');
      console.log(`   Notification Service HEALTH endpoint running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('🚀═══════════════════════════════════════════════🚀');
    });
  } catch (error) {
    console.error('❌ Failed to start notification service:', error);
    process.exit(1); 
  }
};

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  try {
    await closeDatabase();
    console.log('✅ Database connection closed');
    
    console.log('✅ Server closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();