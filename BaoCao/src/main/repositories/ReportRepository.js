class ReportRepository {
  constructor(storageService, reportsFilePath, auditLogPath) {
    this.storageService = storageService;
    this.reportsFilePath = reportsFilePath;
    this.auditLogPath = auditLogPath;
  }

  getAll() {
    return this.storageService.readFileDecrypted(this.reportsFilePath, []);
  }

  async addReport(report, actor) {
    const reports = this.getAll();
    reports.push(report);
    
    await this.storageService.saveFileAtomic(this.reportsFilePath, reports);
    await this.writeAuditLog(actor, 'ADD', 'reports', null, JSON.stringify(report));
    return true;
  }

  async deleteReport(reportId, actor) {
    const reports = this.getAll();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) return false;

    const oldReport = reports[idx];
    reports.splice(idx, 1);

    await this.storageService.saveFileAtomic(this.reportsFilePath, reports);
    await this.writeAuditLog(actor, 'DELETE', 'reports', JSON.stringify(oldReport), null);
    return true;
  }

  async writeAuditLog(actor, action, targetTable, oldValue, newValue) {
    const logs = this.storageService.readFileDecrypted(this.auditLogPath, []);
    const logEntry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      time: new Date().toISOString(),
      actorId: actor ? actor.id : 'system',
      actorName: actor ? actor.name : 'Hệ thống',
      action: action,
      targetTable: targetTable,
      oldValue: oldValue,
      newValue: newValue
    };
    logs.push(logEntry);
    await this.storageService.saveFileAtomic(this.auditLogPath, logs);
  }
}

module.exports = ReportRepository;
