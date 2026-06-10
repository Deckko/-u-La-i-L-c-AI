import { test } from 'node:test';
import assert from 'node:assert';
import { healthService } from '../services/HealthService.js';

test('HealthService: checkHealth trả về cấu trúc đo lường tài nguyên và trạng thái hợp lệ', async () => {
  const result = await healthService.checkHealth();

  // Đảm bảo các thuộc tính được tính toán chính xác
  assert.ok(result.status === 'ok' || result.status === 'degraded' || result.status === 'error');
  assert.ok(typeof result.uptime === 'number');
  
  // Kiểm tra bộ nhớ
  assert.ok(result.memory.free);
  assert.ok(result.memory.total);
  assert.ok(result.memory.usagePercentage);

  // Kiểm tra bộ nhớ tiến trình Node.js
  assert.ok(result.processMemory.heapUsed);
  assert.ok(result.processMemory.heapTotal);
  assert.ok(result.processMemory.rss);

  // Kiểm tra kết nối DB
  assert.ok(result.db.mongo === 'connected' || result.db.mongo === 'disconnected');
  assert.ok(result.db.redis === 'connected' || result.db.redis === 'disconnected');
});
