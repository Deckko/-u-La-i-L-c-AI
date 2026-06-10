import mongoose from 'mongoose';
import { redisClient } from '../index.js';
import logger from '../core/logger.js';
import os from 'os';

export class HealthService {
  /**
   * Kiểm tra tình trạng hoạt động của toàn bộ hệ thống
   */
  async checkHealth(): Promise<{
    status: 'ok' | 'degraded' | 'error';
    uptime: number;
    memory: {
      free: string;
      total: string;
      usagePercentage: string;
    };
    processMemory: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
    };
    db: {
      mongo: 'connected' | 'disconnected';
      redis: 'connected' | 'disconnected';
    };
  }> {
    const uptime = process.uptime();
    
    // Bộ nhớ hệ thống
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(1);

    // Bộ nhớ tiến trình Node.js
    const memoryUsage = process.memoryUsage();

    // Kết nối database
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = redisClient && redisClient.isReady ? 'connected' : 'disconnected';

    let status: 'ok' | 'degraded' | 'error' = 'ok';
    if (mongoStatus === 'disconnected') {
      status = 'error';
    } else if (redisStatus === 'disconnected') {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      memory: {
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercentage: `${memUsage}%`
      },
      processMemory: {
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`
      },
      db: {
        mongo: mongoStatus,
        redis: redisStatus
      }
    };
  }
}

export const healthService = new HealthService();
