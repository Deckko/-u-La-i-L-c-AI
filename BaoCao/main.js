const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Diagnostic logger for main process errors
const LOG_FILE = 'C:\\antigravity\\BaoCao\\main_crash_log.txt';
function logMainError(type, err) {
  try {
    const time = new Date().toISOString();
    const msg = `${time} - [${type}] ${err.stack || err}\n`;
    fs.writeFileSync(LOG_FILE, msg, { flag: 'a' });
  } catch (e) {}
}

process.on('uncaughtException', (err) => logMainError('UncaughtException', err));
process.on('unhandledRejection', (reason) => logMainError('UnhandledRejection', reason));

const StorageService = require('./src/main/services/StorageService');
const PinAuthenticator = require('./src/main/security/PinAuthenticator');
const ReportRepository = require('./src/main/repositories/ReportRepository');

let mainWindow;

// Determine the storage path. Prioritize E drive as requested.
function getStorageDirectory() {
  const eDrivePath = 'E:\\NetCafeReportData';

  // 1. Try E: Drive
  try {
    if (fs.existsSync('E:\\')) {
      if (!fs.existsSync(eDrivePath)) {
        fs.mkdirSync(eDrivePath, { recursive: true });
      }
      return eDrivePath;
    }
  } catch (err) {
    console.error('Error checking E drive:', err);
  }

  // 2. Try Documents Folder Fallback
  try {
    const fallbackPath = path.join(app.getPath('documents'), 'NetCafeReportData');
    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true });
    }
    return fallbackPath;
  } catch (err) {
    console.error('Error checking Documents folder, falling back to userData:', err);
  }

  // 3. Try AppData (userData) Folder Fallback (always writeable)
  try {
    const userDataPath = path.join(app.getPath('userData'), 'NetCafeReportData');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    return userDataPath;
  } catch (err) {
    console.error('Error checking userData folder, falling back to temp:', err);
  }

  // 4. Final safety resort
  return path.join(__dirname, 'NetCafeReportData');
}

let storageDir;
let storageService;
let employeesFilePath;
let reportsFilePath;
let cashLogsFilePath;
let auditLogPath;
let pinAuthenticator;
let reportRepository;

function initializeStorage() {
  try {
    storageDir = getStorageDirectory();
    storageService = new StorageService(storageDir);

    employeesFilePath = path.join(storageDir, 'employees.json');
    reportsFilePath = path.join(storageDir, 'reports.json');
    cashLogsFilePath = path.join(storageDir, 'cash_logs.json');
    auditLogPath = path.join(storageDir, 'audit_log.json');

    pinAuthenticator = new PinAuthenticator(storageService, employeesFilePath);
    reportRepository = new ReportRepository(storageService, reportsFilePath, auditLogPath);
  } catch (err) {
    console.error('Critical error during storage initialization:', err);
    // Ensure basic mock objects exist to prevent app crash on require/calls
    storageDir = __dirname;
    storageService = new StorageService(storageDir);
    employeesFilePath = path.join(storageDir, 'employees.json');
    reportsFilePath = path.join(storageDir, 'reports.json');
    cashLogsFilePath = path.join(storageDir, 'cash_logs.json');
    auditLogPath = path.join(storageDir, 'audit_log.json');
    pinAuthenticator = new PinAuthenticator(storageService, employeesFilePath);
    reportRepository = new ReportRepository(storageService, reportsFilePath, auditLogPath);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true,
    title: "Hệ Thống Báo Cáo Thiếu/Dư Quán Net",
    backgroundColor: '#0d0e12',
    icon: path.join(__dirname, 'assets/app_icon.png')
  });

  mainWindow.loadFile('index.html');

  // Open the DevTools. (Comment out for production)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  initializeStorage();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC communication handlers
ipcMain.handle('get-storage-info', () => {
  return {
    path: storageDir,
    isEDrive: storageDir.startsWith('E:\\')
  };
});

ipcMain.handle('load-data', () => {
  const employees = storageService.readFileDecrypted(employeesFilePath, []);
  const reports = reportRepository.getAll();
  const cashLogs = storageService.readFileDecrypted(cashLogsFilePath, []);
  return { employees, reports, cashLogs };
});

ipcMain.handle('save-data', async (event, { employees, reports, cashLogs }) => {
  let success = true;
  if (employees) {
    success = success && await storageService.saveFileAtomic(employeesFilePath, employees);
  }
  if (reports) {
    success = success && await storageService.saveFileAtomic(reportsFilePath, reports);
  }
  if (cashLogs) {
    success = success && await storageService.saveFileAtomic(cashLogsFilePath, cashLogs);
  }
  return success;
});

// Các API bảo mật mới qua IPC
ipcMain.handle('verify-pin', (event, employeeId, pin) => {
  return pinAuthenticator.verifyPin(employeeId, pin);
});

ipcMain.handle('verify-manager-pin', (event, pin) => {
  return pinAuthenticator.verifyManagerPin(pin);
});

ipcMain.handle('update-pin', (event, employeeId, oldPin, newPin) => {
  return pinAuthenticator.updatePin(employeeId, oldPin, newPin);
});

ipcMain.handle('change-pin', (event, employeeId, newPin) => {
  // Force-set new PIN without needing old PIN (already verified manager PIN in renderer)
  return pinAuthenticator.updatePin(employeeId, null, newPin, true);
});

ipcMain.handle('delete-report-secure', async (event, reportId, actor) => {
  return await reportRepository.deleteReport(reportId, actor);
});

ipcMain.handle('add-report-secure', async (event, report, actor) => {
  return await reportRepository.addReport(report, actor);
});

// Diagnostic handler for renderer errors
ipcMain.on('log-error', (event, errorMsg) => {
  try {
    const time = new Date().toISOString();
    fs.writeFileSync('C:\\antigravity\\BaoCao\\renderer_crash_log.txt', `${time} - Renderer: ${errorMsg}\n`, { flag: 'a' });
  } catch (e) {}
});
