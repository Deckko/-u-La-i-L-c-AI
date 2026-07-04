const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // Các API bảo mật mới
  verifyPin: (employeeId, pin) => ipcRenderer.invoke('verify-pin', employeeId, pin),
  verifyManagerPin: (pin) => ipcRenderer.invoke('verify-manager-pin', pin),
  updatePin: (employeeId, oldPin, newPin) => ipcRenderer.invoke('update-pin', employeeId, oldPin, newPin),
  deleteReportSecure: (reportId, actor) => ipcRenderer.invoke('delete-report-secure', reportId, actor),
  addReportSecure: (report, actor) => ipcRenderer.invoke('add-report-secure', report, actor),
  changePin: (employeeId, newPin) => ipcRenderer.invoke('change-pin', employeeId, newPin),
  
  // Diagnostic logging
  logError: (errorMsg) => ipcRenderer.send('log-error', errorMsg)
});
