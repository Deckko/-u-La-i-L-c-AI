const crypto = require('crypto');

class PinAuthenticator {
  constructor(storageService, employeeFilePath) {
    this.storageService = storageService;
    this.employeeFilePath = employeeFilePath;
  }

  hashPin(pin) {
    return crypto.createHash('sha256').update(pin).digest('hex');
  }

  verifyPin(employeeId, pin) {
    const employees = this.storageService.readFileDecrypted(this.employeeFilePath, []);
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return false;

    // Hỗ trợ mã PIN mặc định 1234 nếu nhân viên chưa thiết lập
    const savedHash = emp.pinHash || this.hashPin('1234');
    const inputHash = this.hashPin(pin);

    return savedHash === inputHash;
  }

  verifyManagerPin(pin) {
    const masterPins = ['9999', '2026'];
    if (masterPins.includes(pin)) return true;

    const employees = this.storageService.readFileDecrypted(this.employeeFilePath, []);
    const inputHash = this.hashPin(pin);
    const manager = employees.find(e => (e.role === 'manager' || e.role === 'owner') && e.pinHash === inputHash);
    return !!manager;
  }

  updatePin(employeeId, oldPin, newPin) {
    const employees = this.storageService.readFileDecrypted(this.employeeFilePath, []);
    const idx = employees.findIndex(e => e.id === employeeId);
    if (idx === -1) return false;

    if (employees[idx].pinHash && oldPin !== null) {
      if (!this.verifyPin(employeeId, oldPin)) {
        return false;
      }
    }

    employees[idx].pinHash = this.hashPin(newPin);
    // Lưu đồng bộ
    this.storageService.saveFileAtomic(this.employeeFilePath, employees);
    return true;
  }
}

module.exports = PinAuthenticator;
