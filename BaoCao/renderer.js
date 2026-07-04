// SAFE API BRIDGE WRAPPER
// Dynamically fallbacks to Browser LocalStorage if running in a normal browser or without Electron.
if (window.api && window.api.logError && window.pendingErrors) {
  window.pendingErrors.forEach(err => window.api.logError(err));
  window.pendingErrors = [];
}
const appApi = window.api || {
  getStorageInfo: async () => ({
    path: 'Trình duyệt Web (Lưu cục bộ LocalStorage)',
    isEDrive: false,
    isFallback: true
  }),
  loadData: async () => {
    try {
      const employees = JSON.parse(localStorage.getItem('employees')) || [];
      const reports = JSON.parse(localStorage.getItem('reports')) || [];
      const cashLogs = JSON.parse(localStorage.getItem('cashLogs')) || [];
      return { employees, reports, cashLogs };
    } catch (err) {
      console.error('Lỗi load LocalStorage:', err);
      return { employees: [], reports: [], cashLogs: [] };
    }
  },
  saveData: async (data) => {
    try {
      if (data.employees) localStorage.setItem('employees', JSON.stringify(data.employees));
      if (data.reports) localStorage.setItem('reports', JSON.stringify(data.reports));
      if (data.cashLogs) localStorage.setItem('cashLogs', JSON.stringify(data.cashLogs));
      return true;
    } catch (err) {
      console.error('Lỗi save LocalStorage:', err);
      return false;
    }
  }
};

// APPLICATION STATE
const state = {
  employees: [],
  reports: [],
  cashLogs: [], // Shift End Cash Handover Logs
  selectedAvatarIndex: 0,
  activeReporterId: null,
  activeCategory: 'all',
  searchQuery: '',
  activeTab: 'inventory', // 'inventory' or 'cash'
  filters: {
    shift: 'all',
    employee: 'all',
    type: 'all'
  },
  // Temporary reports filled out in the card grid before submitting
  tempReports: {}, // format: { productCode: { qty: 2, type: 'thiếu' } }
  // Counts of each bill denomination
  cashCounts: {
    500000: 0,
    200000: 0,
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0
  },
  transferConfirmed: false, // Track if transfer has been confirmed
  isProgrammaticChange: false // Flag to prevent mutual change recursion
};

// DEFAULT DRINK & SNACK DATABASE
const PRODUCTS = [
  { code: 'warrior_grape', name: 'Warrior Nho', category: 'energy', image: 'assets/warrior_grape.png', color: '#8e24aa' },
  { code: 'warrior_strawberry', name: 'Warrior Dâu', category: 'energy', image: 'assets/warrior_strawberry.png', color: '#d81b60' },
  { code: 'sting_red', name: 'Sting Đỏ', category: 'softdrink', image: 'assets/sting_red.png', color: '#e53935' },
  { code: 'sting_yellow', name: 'Sting Vàng', category: 'softdrink', image: 'assets/sting_yellow.png', color: '#ffb300' },
  { code: 'revive_white', name: 'Revive Trắng', category: 'softdrink', image: 'assets/revive_white.png', color: '#039be5' },
  { code: 'revive_yellow', name: 'Revive Vàng', category: 'softdrink', image: 'assets/revive_yellow.png', color: '#fdd835' },
  { code: 'pepsi', name: 'Pepsi', category: 'softdrink', image: 'assets/pepsi.png', color: '#0d47a1' },
  { code: 'pepsi_zero', name: 'Pepsi Không Calo', category: 'softdrink', image: 'assets/pepsi_zero.png', color: '#212121' },
  { code: 'seven_up', name: '7 Up', category: 'softdrink', image: 'assets/seven_up.png', color: '#43a047' },
  { code: 'rockstar', name: 'Rockstar', category: 'energy', image: 'assets/rockstar.png', color: '#1a1a1a' },
  { code: 'number_one', name: 'Number One', category: 'energy', image: 'assets/number_one.png', color: '#f57c00' },
  { code: 'orange_juice', name: 'Nước Cam Ép', category: 'softdrink', image: 'assets/orange_juice.png', color: '#fb8c00' },
  { code: 'coffee_milk', name: 'Cà Phê Sữa Đá', category: 'coffee', image: 'assets/coffee_milk.png', color: '#6d4c41' },
  { code: 'green_tea_zero', name: 'Trà Xanh Không Độ', category: 'coffee', image: 'assets/green_tea_zero.png', color: '#2e7d32' },
  { code: 'water', name: 'Nước Suối Aquafina', category: 'softdrink', image: 'assets/water.png', color: '#00b0ff' },
  { code: 'red_bull', name: 'Bò Húc (Red Bull)', category: 'energy', image: 'assets/red_bull.png', color: '#ffc107' },
  { code: 'milktea_traditional', name: 'Trà Sữa Truyền Thống', category: 'coffee', image: 'assets/milktea_traditional.png', color: '#d7ccc8' },
  { code: 'milktea_chocolate', name: 'Trà Sữa Socola', category: 'coffee', image: 'assets/milktea_chocolate.png', color: '#3e2723' },
  { code: 'mirinda_sarsi', name: 'Mirinda Xá Xị', category: 'softdrink', image: 'assets/mirinda_sarsi.png', color: '#e65100' },
  { code: 'boss_energy', name: 'Nước Tăng Lực Boss', category: 'energy', image: 'assets/boss_energy.png', color: '#ffd700' },

  // Snacks section
  { code: 'snack_pillows', name: 'Bánh Pillows', category: 'snack', image: 'assets/snack_pillows.png', color: '#e91e63' },
  { code: 'bread_kd_3', name: 'Bánh mì Kinh Đô 3 vị', category: 'snack', image: 'assets/bread_kd_3.png', color: '#8d6e63' },
  { code: 'bread_kd_cb', name: 'Bánh mì Kinh Đô chà bông', category: 'snack', image: 'assets/bread_kd_cb.png', color: '#ffa726' },
  { code: 'poca', name: 'Poca Khoai Tây 27g', category: 'snack', image: 'assets/poca.png', color: '#ffeb3b' },
  { code: 'lays', name: "Lay's Khoai Tây 33g", category: 'snack', image: 'assets/lays.png', color: '#fbc02d' },
  { code: 'peanut', name: 'Đậu Phộng Tân Tân', category: 'snack', image: 'assets/peanut.png', color: '#8d6e63' },
  { code: 'chicken_lemon', name: 'Khô Gà Lá Chanh', category: 'snack', image: 'assets/chicken_lemon.png', color: '#ff9800' },
  { code: 'beef_jerky', name: 'Khô Bò Sợi', category: 'snack', image: 'assets/beef_jerky.png', color: '#d84315' },
  { code: 'banh_trang', name: 'Bánh Tráng Cuộn Bơ', category: 'snack', image: 'assets/banh_trang.png', color: '#a1887f' },
  { code: 'chicken_feet_spicy', name: 'Chân Gà Rút Xương Cay', category: 'snack', image: 'assets/chicken_feet_spicy.png', color: '#e53935' },
  { code: 'chicken_feet_non_spicy', name: 'Chân Gà Rút Xương Không Cay', category: 'snack', image: 'assets/chicken_feet_non_spicy.png', color: '#ffb74d' }
];

// DENOMINATIONS CONFIG
const DENOMINATIONS = [
  { value: 500000, label: '500,000 đ', bg: 'linear-gradient(135deg, #0288d1 0%, #006064 100%)', color: '#00e5ff' },
  { value: 200000, label: '200,000 đ', bg: 'linear-gradient(135deg, #d81b60 0%, #880e4f 100%)', color: '#ff5252' },
  { value: 100000, label: '100,000 đ', bg: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)', color: '#69f0ae' },
  { value: 50000, label: '50,000 đ', bg: 'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)', color: '#ffb74d' },
  { value: 20000, label: '20,000 đ', bg: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', color: '#40c4ff' },
  { value: 10000, label: '10,000 đ', bg: 'linear-gradient(135deg, #6d4c41 0%, #4e342e 100%)', color: '#bcaaa4' },
  { value: 5000, label: '5,000 đ', bg: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: '#90caf9' },
  { value: 2000, label: '2,000 đ', bg: 'linear-gradient(135deg, #455a64 0%, #263238 100%)', color: '#b0bec5' },
  { value: 1000, label: '1,000 đ', bg: 'linear-gradient(135deg, #37474f 0%, #212121 100%)', color: '#cfd8dc' }
];

// GAMING AVATAR PRESETS
const AVATARS = [
  { icon: 'fa-solid fa-gamepad', bg: 'linear-gradient(135deg, #7f00ff, #e100ff)' },
  { icon: 'fa-solid fa-headset', bg: 'linear-gradient(135deg, #00f2fe, #4facfe)' },
  { icon: 'fa-solid fa-fire', bg: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { icon: 'fa-solid fa-crown', bg: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { icon: 'fa-solid fa-shield-halved', bg: 'linear-gradient(135deg, #0ba360, #3cba92)' },
  { icon: 'fa-solid fa-crosshairs', bg: 'linear-gradient(135deg, #f093fb, #f5576c)' }
];

// DOM ELEMENTS
const storagePathText = document.getElementById('storagePathText');
const storageLocationType = document.getElementById('storageLocationType');
const footerEDriveStatus = document.getElementById('footerEDriveStatus');

// Tabs
const btnTabInventory = document.getElementById('btnTabInventory');
const btnTabCash = document.getElementById('btnTabCash');
const tabInventoryContent = document.getElementById('tabInventoryContent');
const tabCashContent = document.getElementById('tabCashContent');

// Inventory Elements
const drinksGrid = document.getElementById('drinksGrid');
const drinkSearchInput = document.getElementById('drinkSearchInput');
const categoryButtons = document.querySelectorAll('.cat-btn');

const addEmployeeForm = document.getElementById('addEmployeeForm');
const employeeNameInput = document.getElementById('employeeNameInput');
const employeeShiftSelect = document.getElementById('employeeShiftSelect');
const avatarPresetsContainer = document.getElementById('avatarPresets');
const employeeList = document.getElementById('employeeList');
const reporterSelect = document.getElementById('reporterSelect');

// Bulk Report Sidebar Elements
const bulkReportForm = document.getElementById('bulkReportForm');
const bulkReportSummary = document.getElementById('bulkReportSummary');
const reportNotesInput = document.getElementById('reportNotesInput');
const reportShiftSelect = document.getElementById('reportShiftSelect');
const btnSubmitBulkReport = document.getElementById('btnSubmitBulkReport');

// Stats Widgets
const totalMissingQty = document.getElementById('totalMissingQty');
const totalExcessQty = document.getElementById('totalExcessQty');
const totalReportsCount = document.getElementById('totalReportsCount');
const activeStaffCount = document.getElementById('activeStaffCount');

// Filters & Table
const filterShiftSelect = document.getElementById('filterShiftSelect');
const filterStaffSelect = document.getElementById('filterStaffSelect');
const filterTypeSelect = document.getElementById('filterTypeSelect');
const btnClearFilters = document.getElementById('btnClearFilters');
const reportsTableBody = document.getElementById('reportsTableBody');
const emptyTableState = document.getElementById('emptyTableState');

// Cash Tab Elements
const cashCalcGrid = document.getElementById('cashCalcGrid');
const btnResetCashCount = document.getElementById('btnResetCashCount');
const totalCashVal = document.getElementById('totalCashVal');
const totalCashWords = document.getElementById('totalCashWords');
const cashReporterSelect = document.getElementById('cashReporterSelect');
const cashReportShiftSelect = document.getElementById('cashReportShiftSelect');
const systemCashInput = document.getElementById('systemCashInput');
const cashDiscrepancyVal = document.getElementById('cashDiscrepancyVal');
const cashReportNotes = document.getElementById('cashReportNotes');
const btnCopyCashReport = document.getElementById('btnCopyCashReport');
const cashReportForm = document.getElementById('cashReportForm');
const cashLogsTableBody = document.getElementById('cashLogsTableBody');
const emptyCashTableState = document.getElementById('emptyCashTableState');

// Docs modal
const btnOpenDocs = document.getElementById('btnOpenDocs');
const btnCloseModal = document.getElementById('btnCloseModal');
const instructionModal = document.getElementById('instructionModal');

// INITIALIZE APP
window.addEventListener('DOMContentLoaded', async () => {
  await loadStorageInfo();
  await loadDatabase();

  renderAvatarPresets();
  renderDrinksMenu();
  renderActiveEmployees();
  updateStats();
  renderReportsTable();
  renderHandoverSummaryTable();
  
  renderCashCalcGrid();
  renderCashLogsTable();

  setupEventListeners();
});

// FUNCTIONS

// 0. Show PIN Prompt Modal
// Wrapper for writing debug logs to file
function logDebug(msg) {
  console.log(msg);
  if (window.api && window.api.logError) {
    window.api.logError(`[DEBUG ${new Date().toISOString()}] ${msg}`);
  }
}

async function showPinPrompt(message, defaultPin = "") {
  logDebug(`showPinPrompt start. Message: "${message}"`);
  try {
    return new Promise((resolve, reject) => {
      try {
        const modal = document.getElementById('pinPromptModal');
        const messageEl = document.getElementById('pinPromptMessage');
        const input = document.getElementById('pinPromptInput');
        const btnConfirm = document.getElementById('btnConfirmPinPrompt');
        const btnCancel = document.getElementById('btnCancelPinPrompt');

        if (!modal || !messageEl || !input || !btnConfirm || !btnCancel) {
          const errMsg = `DOM elements missing: modal=${!!modal}, messageEl=${!!messageEl}, input=${!!input}, btnConfirm=${!!btnConfirm}, btnCancel=${!!btnCancel}`;
          logDebug(`ERROR: ${errMsg}`);
          alert(errMsg);
          reject(new Error(errMsg));
          return;
        }

        logDebug(`pinPromptModal parent element: <${modal.parentElement.tagName} id="${modal.parentElement.id || ''}" class="${modal.parentElement.className || ''}">`);

        messageEl.textContent = message;
        input.value = defaultPin;
        
        logDebug(`Displaying modal (display=flex, opacity=1, pointerEvents=auto)`);
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        
        setTimeout(() => {
          try {
            logDebug(`Timeout callback: focusing and selecting input`);
            input.focus();
            input.select();
          } catch (e) {
            logDebug(`WARNING: Focus failed: ${e.message}`);
          }
        }, 50);

        const cleanUp = () => {
          logDebug(`cleanUp triggered. Removing event listeners.`);
          btnConfirm.removeEventListener('click', onConfirm);
          btnCancel.removeEventListener('click', onCancel);
          input.removeEventListener('keydown', onKeyDown);
          
          logDebug(`Hiding modal (display=none, opacity=0, pointerEvents=none)`);
          modal.style.display = 'none';
          modal.style.opacity = '0';
          modal.style.pointerEvents = 'none';
        };

        const onConfirm = () => {
          const val = input.value.trim();
          logDebug(`onConfirm triggered. Value: "${val}"`);
          cleanUp();
          resolve(val === '' ? null : val);
        };
        const onCancel = () => {
          logDebug(`onCancel triggered.`);
          cleanUp();
          resolve(null);
        };

        const onKeyDown = (e) => {
          if (e.key === 'Enter') {
            logDebug(`Enter keydown event inside input`);
            e.preventDefault();
            onConfirm();
          } else if (e.key === 'Escape') {
            logDebug(`Escape keydown event inside input`);
            e.preventDefault();
            onCancel();
          }
        };

        logDebug(`Attaching click and keydown event listeners`);
        btnConfirm.addEventListener('click', onConfirm);
        btnCancel.addEventListener('click', onCancel);
        input.addEventListener('keydown', onKeyDown);
      } catch (err) {
        logDebug(`ERROR inside Promise: ${err.stack || err.message}`);
        reject(err);
      }
    });
  } catch (outerErr) {
    logDebug(`ERROR outside Promise: ${outerErr.stack || outerErr.message}`);
    throw outerErr;
  }
}

// 1. Generate VietQR URL for shortage amount
function generateVietQrUrl(amount, addInfo) {
  const bank = 'Techcombank';
  const account = '19076481915012';
  const ownerName = 'TA%20QUANG%20HUY';
  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&accountName=${ownerName}`;
}

// 1. Load Storage Info
async function loadStorageInfo() {
  try {
    const info = await appApi.getStorageInfo();
    storagePathText.textContent = info.path;
    if (info.isFallback) {
      storageLocationType.textContent = 'Trình Duyệt';
      storageLocationType.className = 'status-pill fallback-pill';
      footerEDriveStatus.textContent = 'Chạy Offline / Sandbox Browser';
      footerEDriveStatus.className = 'text-pink';
    } else if (info.isEDrive) {
      storageLocationType.textContent = 'Ổ E: BẢO VỆ';
      storageLocationType.className = 'status-pill active-pill';
      footerEDriveStatus.textContent = 'Hoạt động (Được bảo vệ 24/7)';
      footerEDriveStatus.className = 'text-neon-green';
    } else {
      storageLocationType.textContent = 'Ổ C: TẠM THỜI';
      storageLocationType.className = 'status-pill fallback-pill';
      footerEDriveStatus.textContent = 'Không tìm thấy ổ E (Chạy tạm trên ổ C)';
      footerEDriveStatus.className = 'text-pink';
    }
  } catch (err) {
    console.error('Lỗi lấy storage info:', err);
  }
}

// 2. Load DB
async function loadDatabase() {
  try {
    const data = await appApi.loadData();
    state.employees = data.employees || [];
    state.reports = data.reports || [];
    state.cashLogs = data.cashLogs || [];

    if (state.employees.length > 0) {
      state.activeReporterId = state.employees[0].id;
    }
  } catch (err) {
    console.error('Lỗi load DB:', err);
  }
}

// 3. Save DB
async function saveDatabase() {
  try {
    await appApi.saveData({
      employees: state.employees,
      reports: state.reports,
      cashLogs: state.cashLogs
    });
  } catch (err) {
    console.error('Lỗi save DB:', err);
  }
}

// 4. Render Avatar Presets
function renderAvatarPresets() {
  avatarPresetsContainer.innerHTML = '';
  AVATARS.forEach((avatar, index) => {
    const opt = document.createElement('div');
    opt.className = `avatar-opt ${index === state.selectedAvatarIndex ? 'selected-avatar' : ''}`;
    opt.style.background = avatar.bg;
    opt.innerHTML = `<i class="${avatar.icon}" style="color: #fff; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; height: 100%;"></i>`;
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-opt').forEach(el => el.classList.remove('selected-avatar'));
      opt.classList.add('selected-avatar');
      state.selectedAvatarIndex = index;
    });
    avatarPresetsContainer.appendChild(opt);
  });
}

function getProductAggregatedStats(productCode) {
  let balance = 0;
  state.reports.forEach(r => {
    if (r.productCode === productCode) {
      if (r.type === 'dư') {
        balance += r.qty;
      } else if (r.type === 'thiếu') {
        balance -= r.qty;
      }
    }
  });
  return { balance };
}

// 5. Render Drinks Menu
function renderDrinksMenu() {
  drinksGrid.innerHTML = '';
  
  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = state.activeCategory === 'all' || p.category === state.activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredProducts.length === 0) {
    drinksGrid.innerHTML = `<div class="no-data-msg" style="grid-column: 1/-1; padding: 40px 0;">Không tìm thấy nước uống / món ăn nào khớp!</div>`;
    return;
  }

  filteredProducts.forEach(product => {
    const productStats = getProductAggregatedStats(product.code);

    const card = document.createElement('div');
    
    // Check if there is an active modified count in state.tempReports
    const temp = state.tempReports[product.code] || { qty: 0, type: 'thiếu' };
    
    // Determine card active state classes based on quantity > 0
    let activeClass = '';
    if (temp.qty > 0) {
      activeClass = temp.type === 'thiếu' ? 'modified-card modified-card-missing' : 'modified-card modified-card-excess';
    }

    card.className = `drink-card ${activeClass}`;
    card.id = `card-${product.code}`;

    let imgStyle = '';
    let placeholderText = '';
    if (product.image) {
      imgStyle = `background-image: url('${product.image}');`;
    } else {
      imgStyle = `background: linear-gradient(135deg, ${product.color || '#2c3e50'} 0%, #1a252f 100%);`;
      placeholderText = `<div class="p-initials" style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; opacity: 0.25; display: flex; align-items: center; justify-content: center; height: 100%; color: #fff;">${product.name.split(' ').map(w => w[0]).join('').substring(0, 3)}</div>`;
    }

    let badgeHtml = '';
    if (productStats.balance !== 0) {
      if (productStats.balance < 0) {
        badgeHtml = `<span class="card-badge badge-missing">Thiếu ${Math.abs(productStats.balance)}</span>`;
      } else {
        badgeHtml = `<span class="card-badge badge-excess">Dư +${productStats.balance}</span>`;
      }
    }

    // Toggle button style classes
    const toggleClass = temp.type === 'thiếu' ? 'type-missing' : 'type-excess';
    const toggleLabel = temp.type === 'thiếu' ? 'Thiếu (-)' : 'Dư (+)';

    card.innerHTML = `
      <div class="drink-img-wrapper" style="${imgStyle}">
        ${placeholderText}
        ${badgeHtml}
      </div>
      <div class="drink-info">
        <span class="drink-cat">${getFriendlyCategoryName(product.category)}</span>
        <strong class="drink-name">${product.name}</strong>
        
        <!-- Interactive Inline discrepancy input panel on each card -->
        <div class="card-input-panel">
          <div class="card-control-row">
            <button type="button" class="status-toggle-btn ${toggleClass}" id="toggle-type-${product.code}" data-code="${product.code}">
              ${toggleLabel}
            </button>
            <div class="card-qty-wrapper">
              <button type="button" class="card-qty-btn btn-card-dec" data-code="${product.code}">-</button>
              <input type="number" class="card-qty-input input-card-qty" id="input-qty-${product.code}" value="${temp.qty}" min="0" data-code="${product.code}">
              <button type="button" class="card-qty-btn btn-card-inc" data-code="${product.code}">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attaching listeners to inline controls
    const qtyInput = card.querySelector('.input-card-qty');
    const typeToggleBtn = card.querySelector(`#toggle-type-${product.code}`);

    // Click anywhere on card body to quickly increment quantity by 1
    card.addEventListener('click', (e) => {
      // Ignore click if it was on any control buttons or input fields inside the panel
      if (e.target.closest('.card-input-panel')) {
        return;
      }
      let qty = parseInt(qtyInput.value) || 0;
      qtyInput.value = qty + 1;
      updateTempReport(product.code, qty + 1, temp.type);
    });

    // Focus handler for quantity inputs
    qtyInput.addEventListener('focus', () => {
      try {
        qtyInput.select();
      } catch (err) {}
    });

    // Handle typing quantity directly
    qtyInput.addEventListener('input', (e) => {
      let qty = parseInt(e.target.value) || 0;
      if (qty < 0) qty = 0;
      updateTempReport(product.code, qty, temp.type);
    });

    // Increment button handler
    card.querySelector('.btn-card-inc').addEventListener('click', () => {
      let qty = parseInt(qtyInput.value) || 0;
      qtyInput.value = qty + 1;
      updateTempReport(product.code, qty + 1, temp.type);
    });

    // Decrement button handler
    card.querySelector('.btn-card-dec').addEventListener('click', () => {
      let qty = parseInt(qtyInput.value) || 0;
      if (qty > 0) {
        qtyInput.value = qty - 1;
        updateTempReport(product.code, qty - 1, temp.type);
      }
    });

    // Toggle Type button (Thiếu <=> Dư)
    typeToggleBtn.addEventListener('click', () => {
      const nextType = temp.type === 'thiếu' ? 'dư' : 'thiếu';
      
      // Update UI button class and label immediately
      typeToggleBtn.className = `status-toggle-btn ${nextType === 'thiếu' ? 'type-missing' : 'type-excess'}`;
      typeToggleBtn.textContent = nextType === 'thiếu' ? 'Thiếu (-)' : 'Dư (+)';
      
      // Update state and refresh card active glow
      temp.type = nextType;
      updateTempReport(product.code, parseInt(qtyInput.value) || 0, nextType);
    });

    drinksGrid.appendChild(card);
  });
}

// Update state temp reports and toggle visual glowing borders
function updateTempReport(productCode, qty, type) {
  if (qty <= 0) {
    delete state.tempReports[productCode];
  } else {
    state.tempReports[productCode] = { qty, type };
  }

  // Update card glowing borders without redrawing grid (for smoother typing)
  const card = document.getElementById(`card-${productCode}`);
  if (card) {
    card.className = 'drink-card';
    if (qty > 0) {
      card.classList.add('modified-card');
      if (type === 'thiếu') {
        card.classList.add('modified-card-missing');
      } else {
        card.classList.add('modified-card-excess');
      }
    }
  }

  // Update Summary Sidebar List
  updateBulkReportSummary();
}

// Update the list of modified stock discrepancies in the sidebar
function updateBulkReportSummary() {
  bulkReportSummary.innerHTML = '';
  
  const modifiedCodes = Object.keys(state.tempReports);
  
  if (modifiedCodes.length === 0) {
    bulkReportSummary.innerHTML = `<span class="no-data-msg">Chưa điền số lượng cho sản phẩm nào. Vui lòng nhập số lượng trực tiếp trên thẻ sản phẩm bên trái!</span>`;
    btnSubmitBulkReport.disabled = true;
    btnSubmitBulkReport.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Gửi Báo Cáo Kiểm Kho (0)`;
    return;
  }

  modifiedCodes.forEach(code => {
    const temp = state.tempReports[code];
    const product = PRODUCTS.find(p => p.code === code);
    
    if (!product) return;

    const row = document.createElement('div');
    row.className = 'summary-item-row';
    
    const badgeClass = temp.type === 'thiếu' ? 'type-missing' : 'type-excess';
    const badgeLabel = temp.type === 'thiếu' ? 'Thiếu' : 'Dư';

    row.innerHTML = `
      <span class="summary-item-name">${product.name}</span>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="summary-item-qty-badge ${badgeClass}">${badgeLabel}: ${temp.qty}</span>
        <button type="button" class="btn-action btn-action-del remove-summary-item" data-code="${code}" style="width: 20px; height: 20px;" title="Reset về 0">
          &times;
        </button>
      </div>
    `;

    // Click 'x' to reset quantity
    row.querySelector('.remove-summary-item').addEventListener('click', () => {
      const input = document.getElementById(`input-qty-${code}`);
      if (input) input.value = '0';
      updateTempReport(code, 0, temp.type);
    });

    bulkReportSummary.appendChild(row);
  });

  // Enable/Disable submit button based on items presence
  const hasModifiedItems = modifiedCodes.length > 0;
  btnSubmitBulkReport.disabled = !hasModifiedItems;
  btnSubmitBulkReport.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Gửi Báo Cáo Kiểm Kho (${modifiedCodes.length})`;
}

function getFriendlyCategoryName(cat) {
  switch (cat) {
    case 'energy': return 'Nước tăng lực';
    case 'softdrink': return 'Nước ngọt ga';
    case 'coffee': return 'Trà & Cà phê';
    case 'snack': return 'Ăn vặt / Bánh';
    default: return 'Khác';
  }
}

function validateBulkReportForm() {
  const hasModifiedItems = Object.keys(state.tempReports).length > 0;
  btnSubmitBulkReport.disabled = !hasModifiedItems;
}

function calculateEmployeeRiskScore(empId) {
  // Lấy các báo cáo thiếu hụt của nhân viên này
  const empReports = state.reports.filter(r => r.employeeId === empId && r.type === 'thiếu');
  const missingQty = empReports.reduce((sum, r) => sum + r.qty, 0);

  // Lấy lịch sử kết ca tiền mặt
  const empCashLogs = state.cashLogs.filter(l => l.employeeId === empId);
  let totalDiscrepancy = 0;
  let cashLogsCount = empCashLogs.length;
  empCashLogs.forEach(l => {
    totalDiscrepancy += Math.abs(l.totalCash - l.systemCash);
  });

  const avgDiscrepancy = cashLogsCount > 0 ? (totalDiscrepancy / cashLogsCount) : 0;

  // Thuật toán tính chỉ số rủi ro:
  // Mỗi số lượng hao hụt nước cộng 4 điểm rủi ro.
  // Mỗi 10k chênh lệch tiền mặt trung bình cộng 1.5 điểm rủi ro.
  let score = Math.floor(missingQty * 4 + (avgDiscrepancy / 10000) * 1.5);
  return Math.min(100, score);
}

function getRiskBadgeHtml(score) {
  let color = 'text-neon-green';
  let label = 'An toàn';
  if (score > 60) {
    color = 'text-pink';
    label = 'Rủi ro Cao!';
  } else if (score > 30) {
    color = 'text-cyan';
    label = 'Trung bình';
  }
  return `<span class="${color}" style="font-size: 0.72rem; font-weight: 700;">Rủi ro: ${score}/100 (${label})</span>`;
}

// 6. Render Active Employees
function renderActiveEmployees() {
  state.isProgrammaticChange = true;
  try {
    employeeList.innerHTML = '';
    
    reporterSelect.innerHTML = '<option value="">-- Chọn nhân viên --</option>';
    cashReporterSelect.innerHTML = '<option value="">-- Chọn nhân viên bàn giao --</option>';
    filterStaffSelect.innerHTML = '<option value="all">Tất cả nhân viên</option>';

    if (state.employees.length === 0) {
      employeeList.innerHTML = `<div class="no-data-msg">Chưa có nhân viên nào. Vui lòng thêm tên ở trên!</div>`;
      return;
    }

    state.employees.forEach(emp => {
      // Add to selectors
      const opt = document.createElement('option');
      opt.value = emp.id;
      opt.textContent = `${emp.name} (${emp.defaultShift.split(' ')[0]})`;
      reporterSelect.appendChild(opt);

      const opt2 = document.createElement('option');
      opt2.value = emp.id;
      opt2.textContent = `${emp.name} (${emp.defaultShift.split(' ')[0]})`;
      cashReporterSelect.appendChild(opt2);

      const filterOpt = document.createElement('option');
      filterOpt.value = emp.id;
      filterOpt.textContent = emp.name;
      filterStaffSelect.appendChild(filterOpt);

      // Row layout
      const row = document.createElement('div');
      row.className = `employee-row ${state.activeReporterId === emp.id ? 'active-reporter-row' : ''}`;
      const avatarObj = AVATARS[emp.avatar] || AVATARS[0];
      const riskScore = calculateEmployeeRiskScore(emp.id);
      row.innerHTML = `
        <div class="emp-details" style="width: 100%; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="emp-avatar" style="background: ${avatarObj.bg}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i class="${avatarObj.icon}" style="color: #fff; font-size: 0.9rem;"></i>
            </div>
            <div class="emp-name-tag">
              <span class="emp-name">${emp.name}</span>
              <span class="emp-shift">${emp.defaultShift}</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
            ${getRiskBadgeHtml(riskScore)}
            ${state.activeReporterId === emp.id ? '<span class="active-reporter-indicator" style="margin: 0;"><i class="fa-solid fa-circle-check"></i> Đang trực</span>' : ''}
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <button class="btn-action btn-action-pin btn-change-pin" title="Đổi mã PIN" data-empid="${emp.id}" style="font-size:0.7rem; padding: 3px 8px; background: rgba(127,0,255,0.2); border: 1px solid rgba(127,0,255,0.4); border-radius:4px; color: var(--accent-purple); cursor:pointer;" onclick="event.stopPropagation()">
                <i class="fa-solid fa-key"></i> PIN
              </button>
              <button class="btn-action btn-action-del btn-del-emp" title="Xóa nhân viên" data-empid="${emp.id}" style="font-size:0.7rem; padding: 3px 8px; background: rgba(255,51,102,0.2); border: 1px solid rgba(255,51,102,0.4); border-radius:4px; color: var(--accent-pink); cursor:pointer;" onclick="event.stopPropagation()">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Attach click handlers for PIN change and delete buttons
      row.querySelector('.btn-change-pin').addEventListener('click', async (e) => {
        e.stopPropagation();
        logDebug(`btn-change-pin clicked for: ${emp.name}`);
        if (window.api && window.api.changePin) {
          logDebug(`Prompting master PIN for verification`);
          const mgPin = await showPinPrompt(`Xác thực Quản lý - Đổi PIN cho ${emp.name} (Master PIN: 9999):`, '');
          logDebug(`Master PIN prompt returned: ${mgPin === null ? 'null' : 'value'}`);
          if (mgPin === null) return;
          
          logDebug(`Calling verifyManagerPin API`);
          const isMgValid = await window.api.verifyManagerPin(mgPin);
          logDebug(`verifyManagerPin returned: ${isMgValid}`);
          if (!isMgValid) { alert('Sai mã PIN quản lý!'); return; }
          
          logDebug(`Prompting new PIN for employee`);
          const newPin = await showPinPrompt(`Nhập mã PIN mới cho nhân viên ${emp.name} (4-8 số):`, '');
          logDebug(`New PIN prompt returned: ${newPin ? 'value' : 'null'}`);
          if (!newPin || newPin.trim() === '') return;
          
          logDebug(`Calling changePin API`);
          await window.api.changePin(emp.id, newPin.trim());
          logDebug(`changePin API completed`);
          alert(`Đã đổi PIN cho ${emp.name} thành công!`);
        } else {
          logDebug(`changePin API not available, showing alert`);
          alert('Tính năng đổi PIN chỉ hoạt động trong Electron app. Hãy mở bằng file .exe');
        }
      });

      row.querySelector('.btn-del-emp').addEventListener('click', async (e) => {
        e.stopPropagation();
        logDebug(`btn-del-emp clicked for: ${emp.name}`);
        if (window.api && window.api.verifyManagerPin) {
          logDebug(`Prompting master PIN for deletion`);
          const pin = await showPinPrompt(`Nhập PIN Quản lý để xóa nhân viên ${emp.name} (Master PIN: 9999):`, '');
          logDebug(`Master PIN prompt returned: ${pin === null ? 'null' : 'value'}`);
          if (pin === null) return;
          
          logDebug(`Calling verifyManagerPin API`);
          const isValid = await window.api.verifyManagerPin(pin);
          logDebug(`verifyManagerPin returned: ${isValid}`);
          if (!isValid) { alert('Sai mã PIN! Không thể xóa.'); return; }
        }
        
        logDebug(`Deleting employee ${emp.name} (id: ${emp.id})`);
        const idx = state.employees.findIndex(e => e.id === emp.id);
        if (idx !== -1) {
          state.employees.splice(idx, 1);
          if (state.activeReporterId === emp.id) state.activeReporterId = null;
          await saveDatabase();
          renderActiveEmployees();
          updateStats();
        }
        logDebug(`btn-del-emp click handler finished`);
      });

      row.addEventListener('click', async () => {
        logDebug(`Employee card clicked for: ${emp.name} (id: ${emp.id})`);
        // Xác thực mã PIN bảo mật khi bấm trực tiếp
        if (window.api && window.api.verifyPin) {
          logDebug(`Security API verifyPin is available. Prompting PIN.`);
          const pin = await showPinPrompt(`Nhập mã PIN của nhân viên ${emp.name} để đăng nhập trực ca (mặc định: 1234):`);
          logDebug(`PIN prompt returned: ${pin === null ? 'null' : 'value'}`);
          if (pin === null) return;
          
          logDebug(`Calling verifyPin API`);
          const isValid = await window.api.verifyPin(emp.id, pin);
          logDebug(`verifyPin returned: ${isValid}`);
          if (!isValid) {
            alert('Sai mã PIN! Chuyển đổi ca trực thất bại.');
            return;
          }
        } else {
          logDebug(`No verifyPin API available (browser mode or not Electron). Skipping PIN prompt.`);
        }

        logDebug(`Setting active reporter to emp.id: ${emp.id}`);
        state.activeReporterId = emp.id;
        renderActiveEmployees();
        validateBulkReportForm();
        logDebug(`Employee card click handler finished`);
      });

      employeeList.appendChild(row);
    });

    if (state.activeReporterId) {
      reporterSelect.value = state.activeReporterId;
      cashReporterSelect.value = state.activeReporterId;
      const emp = state.employees.find(e => e.id === state.activeReporterId);
      if (emp) {
        reportShiftSelect.value = emp.defaultShift;
        cashReportShiftSelect.value = emp.defaultShift;
      }
    }

    filterStaffSelect.value = state.filters.employee;
  } finally {
    state.isProgrammaticChange = false;
  }
}

// 7. Update stats widgets
function updateStats() {
  let totalMissing = 0;
  let totalExcess = 0;

  state.reports.forEach(r => {
    if (r.type === 'thiếu') {
      totalMissing += r.qty;
    } else if (r.type === 'dư') {
      totalExcess += r.qty;
    }
  });

  totalMissingQty.textContent = totalMissing;
  totalExcessQty.textContent = totalExcess;
  totalReportsCount.textContent = state.reports.length;
  activeStaffCount.textContent = state.employees.length;
}

// 8. Render reports list table
function renderReportsTable() {
  reportsTableBody.innerHTML = '';

  const filteredReports = state.reports.filter(r => {
    const matchShift = state.filters.shift === 'all' || r.shift === state.filters.shift;
    const matchStaff = state.filters.employee === 'all' || r.employeeId === state.filters.employee;
    const matchType = state.filters.type === 'all' || r.type === state.filters.type;
    return matchShift && matchStaff && matchType;
  });

  if (filteredReports.length === 0) {
    emptyTableState.style.display = 'flex';
    return;
  }

  emptyTableState.style.display = 'none';

  const sortedReports = [...filteredReports].sort((a, b) => new Date(b.time) - new Date(a.time));

  sortedReports.forEach(report => {
    const tr = document.createElement('tr');
    
    const dateObj = new Date(report.time);
    const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    const emp = state.employees.find(e => e.id === report.employeeId);
    let avatarHtml = '';
    if (emp) {
      const avatarObj = AVATARS[emp.avatar] || AVATARS[0];
      avatarHtml = `
        <div class="emp-details" style="gap: 8px;">
          <div class="emp-avatar" style="width: 24px; height: 24px; background: ${avatarObj.bg}; display: flex; align-items: center; justify-content: center;">
            <i class="${avatarObj.icon}" style="color: #fff; font-size: 0.7rem;"></i>
          </div>
          <span style="font-weight: 500;">${report.employeeName}</span>
        </div>
      `;
    } else {
      avatarHtml = report.employeeName;
    }

    const statusClass = report.type === 'thiếu' ? 'status-missing' : 'status-excess';
    const statusText = report.type === 'thiếu' ? 'Thiếu (-)' : 'Dư (+)';
    const qtyColorClass = report.type === 'thiếu' ? 'text-pink' : 'text-cyan';

    tr.innerHTML = `
      <td>
        <div class="log-time">${timeStr}</div>
        <div class="log-time" style="font-size: 0.7rem; opacity: 0.6;">${dateStr}</div>
      </td>
      <td>${avatarHtml}</td>
      <td><span style="font-size: 0.85rem; color: var(--text-muted);">${report.shift}</span></td>
      <td><strong>${report.productName}</strong></td>
      <td class="qty-tag ${qtyColorClass} text-center">${report.qty}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td><span class="reason-text">${report.notes || '---'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-action-inc" title="Tăng số lượng" data-id="${report.id}"><i class="fa-solid fa-plus"></i></button>
          <button class="btn-action btn-action-dec" title="Giảm số lượng" data-id="${report.id}"><i class="fa-solid fa-minus"></i></button>
          <button class="btn-action btn-action-del" title="Xóa báo cáo" data-id="${report.id}"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    `;

    tr.querySelector('.btn-action-inc').addEventListener('click', () => adjustReportQty(report.id, 1));
    tr.querySelector('.btn-action-dec').addEventListener('click', () => adjustReportQty(report.id, -1));
    tr.querySelector('.btn-action-del').addEventListener('click', () => deleteReport(report.id));

    reportsTableBody.appendChild(tr);
  });
}

async function adjustReportQty(reportId, change) {
  const index = state.reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = state.reports[index];
    const newQty = report.qty + change;
    
    if (newQty <= 0) {
      const confirmDelete = confirm(`Bạn có chắc muốn xóa báo cáo ${report.productName} này không?`);
      if (confirmDelete) {
        state.reports.splice(index, 1);
      }
    } else {
      report.qty = newQty;
    }

    await saveDatabase();
    updateStats();
    renderReportsTable();
    renderHandoverSummaryTable();
    renderDrinksMenu();
  }
}

async function deleteReport(reportId) {
  logDebug(`deleteReport start for reportId: ${reportId}`);
  const index = state.reports.findIndex(r => r.id === reportId);
  if (index !== -1) {
    const report = state.reports[index];
    logDebug(`Found report: "${report.productName}"`);
    
    // Kiểm tra mã PIN quản lý để thực thi xóa bản ghi bảo mật
    if (window.api && window.api.verifyManagerPin) {
      logDebug(`Security API verifyManagerPin is available. Prompting PIN.`);
      const pin = await showPinPrompt(`Nhập mã PIN Quản lý để xóa báo cáo "${report.productName}" (PIN mặc định: 9999):`);
      logDebug(`PIN prompt returned: ${pin === null ? 'null' : 'value'}`);
      if (pin === null) return;
      
      logDebug(`Calling verifyManagerPin API`);
      const isValid = await window.api.verifyManagerPin(pin);
      logDebug(`verifyManagerPin returned: ${isValid}`);
      if (!isValid) {
        alert('Mã PIN không đúng! Thao tác xóa bị từ chối.');
        return;
      }
      // PIN đúng -> xóa ngay, không cần confirm() thêm
      if (window.api && window.api.deleteReportSecure) {
        const actor = state.employees.find(e => e.id === state.activeReporterId) || { id: 'system', name: 'Ẩn danh' };
        logDebug(`Calling deleteReportSecure API for reportId: ${reportId}, actor: ${actor.name}`);
        await window.api.deleteReportSecure(reportId, actor);
        logDebug(`deleteReportSecure API completed`);
      } else {
        logDebug(`Fallback: splicing from state.reports directly`);
        state.reports.splice(index, 1);
        await saveDatabase();
      }
    } else {
      // Chạy trên browser (không có API) -> xóa trực tiếp
      logDebug(`No secure API available, browser mode. Deleting directly.`);
      state.reports.splice(index, 1);
      await saveDatabase();
    }

    logDebug(`Reloading database and rendering tables`);
    await loadDatabase();
    updateStats();
    renderReportsTable();
    renderHandoverSummaryTable();
    renderDrinksMenu();
    logDebug(`deleteReport finished`);
  }
}

// ==========================================
// 9. SHIFT CASH CALCULATOR FUNCTIONS
// ==========================================

function renderCashCalcGrid() {
  cashCalcGrid.innerHTML = '';
  
  DENOMINATIONS.forEach(denom => {
    const val = denom.value;
    const card = document.createElement('div');
    card.className = 'bill-card';
    card.innerHTML = `
      <div class="bill-header" style="background: ${denom.bg}; color: #fff;">
        ${denom.label}
      </div>
      <div class="bill-body">
        <label style="font-size: 0.75rem; color: var(--text-muted);">SỐ TỜ (BẢN GIẤY):</label>
        <div class="bill-qty-control">
          <button type="button" class="bill-qty-btn btn-dec-bill" data-value="${val}">-</button>
          <input type="number" class="bill-qty-input" data-value="${val}" id="input-bill-${val}" value="${state.cashCounts[val]}" min="0">
          <button type="button" class="bill-qty-btn btn-inc-bill" data-value="${val}">+</button>
        </div>
        <div class="bill-subtotal">
          <span>Thành tiền:</span>
          <span class="bill-subtotal-val" id="subtotal-${val}">0đ</span>
        </div>
      </div>
    `;

    const inputField = card.querySelector('.bill-qty-input');
    
    // Auto-select text on focus so user can overwrite it without deleting '0'
    inputField.addEventListener('focus', () => {
      try {
        inputField.select();
      } catch (err) {}
    });

    // Click directly on the input to select all text
    inputField.addEventListener('click', () => {
      try { inputField.select(); } catch (err) {}
    });

    // Clicking card header (+1 shortcut)
    card.querySelector('.bill-header').addEventListener('click', () => {
      let qty = parseInt(inputField.value) || 0;
      inputField.value = qty + 1;
      state.cashCounts[val] = qty + 1;
      updateCashCalculation();
    });

    // Enter keydown navigation: Jumps to the next lower denomination
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('.bill-qty-input'));
        const idx = inputs.indexOf(inputField);
        if (idx !== -1 && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
          try {
            inputs[idx + 1].select();
          } catch (err) {}
        } else {
          systemCashInput.focus();
          try {
            systemCashInput.select();
          } catch (err) {}
        }
      }
    });
    
    inputField.addEventListener('input', (e) => {
      let qty = parseInt(e.target.value) || 0;
      if (qty < 0) qty = 0;
      state.cashCounts[val] = qty;
      updateCashCalculation();
    });

    card.querySelector('.btn-inc-bill').addEventListener('click', () => {
      let qty = parseInt(inputField.value) || 0;
      inputField.value = qty + 1;
      state.cashCounts[val] = qty + 1;
      updateCashCalculation();
    });

    card.querySelector('.btn-dec-bill').addEventListener('click', () => {
      let qty = parseInt(inputField.value) || 0;
      if (qty > 0) {
        inputField.value = qty - 1;
        state.cashCounts[val] = qty - 1;
        updateCashCalculation();
      }
    });

    cashCalcGrid.appendChild(card);
  });

  updateCashCalculation();
}

function updateCashCalculation() {
  let grandTotal = 0;
  
  DENOMINATIONS.forEach(denom => {
    const val = denom.value;
    const qty = state.cashCounts[val] || 0;
    const subtotal = qty * val;
    grandTotal += subtotal;

    const subtotalText = document.getElementById(`subtotal-${val}`);
    if (subtotalText) {
      subtotalText.textContent = formatCurrency(subtotal) + 'đ';
    }
  });

  totalCashVal.textContent = formatCurrency(grandTotal) + 'đ';
  totalCashWords.textContent = numberToVietnameseWords(grandTotal);

  updateDiscrepancy(grandTotal);
}

function updateDiscrepancy(totalCashCounted) {
  const raw = (systemCashInput.value || '').replace(/[^0-9]/g, '');
  const sysVal = parseInt(raw) || 0;
  const discrepancy = totalCashCounted - sysVal;

  cashDiscrepancyVal.className = 'discrepancy-badge';
  const qrContainer = document.getElementById('qrContainer');
  const transferWarning = document.getElementById('transferWarning');
  const btnConfirmTransfer = document.getElementById('btnConfirmTransfer');
  const transferConfirmedBadge = document.getElementById('transferConfirmedBadge');
  const btnSubmit = document.getElementById('btnSubmitCashReport');

  if (sysVal === 0 || discrepancy >= 0) {
    // Không thiếu tiền - ẩn QR, enable nút lưu
    cashDiscrepancyVal.textContent = discrepancy > 0
      ? `Thừa +${formatCurrency(discrepancy)}đ`
      : 'Khớp ca (0đ)';
    cashDiscrepancyVal.classList.add('discrepancy-positive');
    qrContainer.style.display = 'none';
    state.transferConfirmed = false;
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.style.opacity = '1'; }
  } else {
    // Thiếu tiền -> hiện QR chuyển khoản
    const amount = Math.abs(discrepancy);
    cashDiscrepancyVal.textContent = `Thiếu ${formatCurrency(amount)}đ (cần chuyển khoản)`;
    cashDiscrepancyVal.classList.add('discrepancy-negative');

    const empId = cashReporterSelect.value;
    const emp = state.employees.find(e => e.id === empId);
    const shift = cashReportShiftSelect.value || 'Ca';
    const empName = emp ? emp.name : 'NV';
    const addInfo = `Ket ca ${empName} - ${shift}`;

    document.getElementById('qrTransferAmountVal').textContent = formatCurrency(amount) + 'đ';
    const qrUrl = generateVietQrUrl(amount, addInfo);
    document.getElementById('vietQrImg').src = qrUrl;
    qrContainer.style.display = 'block';

    // Kiểm tra trạng thái xác nhận CK
    if (state.transferConfirmed) {
      if (transferWarning) transferWarning.style.display = 'none';
      if (btnConfirmTransfer) btnConfirmTransfer.style.display = 'none';
      if (transferConfirmedBadge) transferConfirmedBadge.style.display = 'block';
      if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.style.opacity = '1'; }
    } else {
      if (transferWarning) transferWarning.style.display = 'block';
      if (btnConfirmTransfer) btnConfirmTransfer.style.display = 'flex';
      if (transferConfirmedBadge) transferConfirmedBadge.style.display = 'none';
      if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.style.opacity = '0.5'; }
    }
  }
}

function resetCashCalculator() {
  DENOMINATIONS.forEach(denom => {
    const val = denom.value;
    state.cashCounts[val] = 0;
    const input = document.getElementById(`input-bill-${val}`);
    if (input) input.value = '0';
  });
  systemCashInput.value = '';
  cashReportNotes.value = '';
  state.transferConfirmed = false;
  // Reset transfer UI
  const btnSubmit = document.getElementById('btnSubmitCashReport');
  if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.style.opacity = '1'; }
  const transferConfirmedBadge = document.getElementById('transferConfirmedBadge');
  if (transferConfirmedBadge) transferConfirmedBadge.style.display = 'none';
  const btnConfirmTransfer = document.getElementById('btnConfirmTransfer');
  if (btnConfirmTransfer) btnConfirmTransfer.style.display = 'flex';
  const transferWarning = document.getElementById('transferWarning');
  if (transferWarning) transferWarning.style.display = 'block';
  updateCashCalculation();
}

function numberToVietnameseWords(num) {
  if (num === 0) return 'Không đồng';
  
  const units = ['', 'ngàn', 'triệu', 'tỷ', 'ngàn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  
  let result = '';
  
  function readThreeDigits(n, showZeroHundred) {
    let hundred = Math.floor(n / 100);
    let ten = Math.floor((n % 100) / 10);
    let unit = n % 10;
    let s = '';
    
    if (hundred > 0 || showZeroHundred) {
      s += digits[hundred] + ' trăm ';
    }
    
    if (ten > 0) {
      if (ten === 1) s += 'mười ';
      else s += digits[ten] + ' mươi ';
    } else if (hundred > 0 && unit > 0) {
      s += 'lẻ ';
    }
    
    if (unit > 0) {
      if (unit === 1 && ten > 1) s += 'mốt ';
      else if (unit === 5 && ten > 0) s += 'lăm ';
      else s += digits[unit] + ' ';
    }
    
    return s;
  }
  
  let temp = num;
  let blocks = [];
  
  while (temp > 0) {
    blocks.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  
  for (let i = blocks.length - 1; i >= 0; i--) {
    let block = blocks[i];
    if (block > 0) {
      let showZeroHundred = (i < blocks.length - 1);
      result += readThreeDigits(block, showZeroHundred) + units[i] + ' ';
    }
  }
  
  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  return result.replace(/\s+/g, ' ');
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US').format(val);
}

function getShortDenomLabel(val) {
  if (val >= 1000) return (val / 1000) + 'k';
  return val;
}

function copyCashReportToClipboard() {
  const empId = cashReporterSelect.value;
  const shift = cashReportShiftSelect.value;
  
  if (!empId) {
    alert('Vui lòng chọn nhân viên bàn giao trước khi copy báo cáo!');
    return;
  }

  const emp = state.employees.find(e => e.id === empId);
  const totalCounted = Object.keys(state.cashCounts).reduce((total, val) => {
    return total + (state.cashCounts[val] * parseInt(val));
  }, 0);

  const sysVal = parseInt(systemCashInput.value) || 0;
  const discrepancy = totalCounted - sysVal;
  const noteStr = cashReportNotes.value.trim() || 'Không có';

  let breakdownText = '';
  DENOMINATIONS.forEach(denom => {
    const qty = state.cashCounts[denom.value] || 0;
    if (qty > 0) {
      breakdownText += `📍 ${denom.label} : ${qty} tờ (= ${formatCurrency(qty * denom.value)}đ)\n`;
    }
  });

  if (breakdownText === '') {
    breakdownText = 'Chưa đếm mệnh giá nào (0 tờ).\n';
  }

  const dateStr = new Date().toLocaleString('vi-VN');

  const reportString = 
`=== BÁO CÁO KẾT CA TIỀN MẶT ===
👤 Nhân viên: ${emp.name}
⏰ Thời gian: ${dateStr}
🌅 Ca bàn giao: ${shift}
----------------------------------------
BẢNG KÊ CHI TIẾT MỆNH GIÁ:
${breakdownText}----------------------------------------
💰 THỰC TẾ TIỀN MẶT: ${formatCurrency(totalCounted)}đ
✍️ Bằng chữ: ${numberToVietnameseWords(totalCounted)}
💻 Tiền GCafe/CSM báo: ${formatCurrency(sysVal)}đ
⚖️ Chênh lệch: ${discrepancy >= 0 ? '+' : ''}${formatCurrency(discrepancy)}đ (${discrepancy === 0 ? 'Khớp ca' : discrepancy > 0 ? 'Thừa tiền' : 'Thiếu hụt'})
📝 Ghi chú: ${noteStr}
========================================`;

  navigator.clipboard.writeText(reportString).then(() => {
    alert('Đã sao chép báo cáo kết ca tiền mặt dạng Zalo vào bộ nhớ đệm (Clipboard)! Hãy paste sang Zalo.');
  }).catch(err => {
    console.error('Lỗi copy clipboard:', err);
    alert('Có lỗi khi copy, vui lòng thử lại.');
  });
}

function renderCashLogsTable() {
  cashLogsTableBody.innerHTML = '';
  
  if (state.cashLogs.length === 0) {
    emptyCashTableState.style.display = 'flex';
    return;
  }

  emptyCashTableState.style.display = 'none';

  const sortedLogs = [...state.cashLogs].sort((a, b) => new Date(b.time) - new Date(a.time));

  sortedLogs.forEach(log => {
    const tr = document.createElement('tr');
    
    const dateObj = new Date(log.time);
    const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    let breakdownHtml = '<div class="cash-breakdown-container">';
    DENOMINATIONS.forEach(denom => {
      const qty = (log.counts && log.counts[denom.value]) || 0;
      if (qty > 0) {
        breakdownHtml += `<span class="breakdown-badge" style="border-color: ${denom.color}; color: ${denom.color}">${getShortDenomLabel(denom.value)} x <strong>${qty}</strong></span>`;
      }
    });
    breakdownHtml += '</div>';
    if (breakdownHtml === '<div class="cash-breakdown-container"></div>') {
      breakdownHtml = '<span style="color: var(--text-muted); font-style: italic;">Không có</span>';
    }

    const discrepancy = log.totalCash - log.systemCash;
    let diffHtml = '';
    if (discrepancy === 0) {
      diffHtml = `<span class="status-badge status-excess" style="background: rgba(0, 255, 204, 0.15); color: var(--accent-cyan); border-color: rgba(0, 255, 204, 0.3);">Khớp</span>`;
    } else if (discrepancy > 0) {
      diffHtml = `<span class="status-badge status-excess">Thừa +${formatCurrency(discrepancy)}đ</span>`;
    } else {
      diffHtml = `<span class="status-badge status-missing">Thiếu -${formatCurrency(Math.abs(discrepancy))}đ</span>`;
    }

    // Build transfer and status HTML
    const ckAmount = log.transferAmount || 0;
    const ckHtml = ckAmount > 0
      ? `<span class="qty-tag" style="color: #ff9800; font-weight:700;">${formatCurrency(ckAmount)}đ</span>`
      : `<span style="color: var(--text-muted); font-style:italic;">Không</span>`;

    let statusHtml = '';
    const status = log.reconcileStatus;
    if (status === 'da_ck' || (ckAmount > 0 && !status)) {
      statusHtml = `<span class="status-badge" style="background:rgba(0,200,81,0.15);color:#00c851;border-color:rgba(0,200,81,0.4);"><i class="fa-solid fa-circle-check"></i> Đã CK</span>`;
    } else if (status === 'khớp' || status === undefined && ckAmount === 0 && (log.totalCash - log.systemCash) === 0) {
      statusHtml = `<span class="status-badge status-excess" style="background:rgba(0,255,204,0.15);color:var(--accent-cyan);border-color:rgba(0,255,204,0.3);">✓ Khớp</span>`;
    } else if (status === 'thừa' || (log.totalCash - log.systemCash) > 0) {
      statusHtml = `<span class="status-badge status-excess">Thừa +${formatCurrency(log.totalCash - log.systemCash)}đ</span>`;
    } else {
      statusHtml = `<span class="status-badge status-missing"><i class="fa-solid fa-triangle-exclamation"></i> Thiếu</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="log-time">${timeStr}</div>
        <div class="log-time" style="font-size: 0.7rem; opacity: 0.6;">${dateStr}</div>
      </td>
      <td><strong>${log.employeeName}</strong></td>
      <td><span style="font-size: 0.85rem; color: var(--text-muted);">${log.shift}</span></td>
      <td>${breakdownHtml}</td>
      <td class="qty-tag text-neon-green">${formatCurrency(log.totalCash)}đ</td>
      <td class="qty-tag" style="color: var(--text-muted);">${formatCurrency(log.systemCash)}đ</td>
      <td class="text-center">${ckHtml}</td>
      <td class="text-center">${statusHtml}</td>
      <td class="text-center">
        <button class="btn-action btn-action-del btn-del-cash-log" title="Xóa kết ca" data-id="${log.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    tr.querySelector('.btn-del-cash-log').addEventListener('click', () => deleteCashLog(log.id));

    cashLogsTableBody.appendChild(tr);
  });
}

async function deleteCashLog(logId) {
  const index = state.cashLogs.findIndex(l => l.id === logId);
  if (index !== -1) {
    const log = state.cashLogs[index];

    // Xác thực mã PIN quản lý cho việc xóa kết ca
    if (window.api && window.api.verifyManagerPin) {
      const pin = await showPinPrompt(`Nhập mã PIN Quản lý để xóa kết ca ${formatCurrency(log.totalCash)}đ của ${log.employeeName} (PIN mặc định: 9999):`);
      if (pin === null) return;
      const isValid = await window.api.verifyManagerPin(pin);
      if (!isValid) {
        alert('Mã PIN không đúng! Thao tác xóa lịch sử bị từ chối.');
        return;
      }
      // PIN đúng -> xóa ngay, không dùng confirm()
    }
    // Xóa bản ghi
    state.cashLogs.splice(index, 1);
    await saveDatabase();
    renderCashLogsTable();
    renderActiveEmployees(); // Refresh risk score
  }
}

// ==========================================
// 10. SETUP ALL EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Tab Switching
  btnTabInventory.addEventListener('click', () => {
    btnTabInventory.classList.add('active');
    btnTabCash.classList.remove('active');
    tabInventoryContent.classList.add('active');
    tabCashContent.classList.remove('active');
    state.activeTab = 'inventory';
    renderDrinksMenu();
  });

  btnTabCash.addEventListener('click', () => {
    btnTabCash.classList.add('active');
    btnTabInventory.classList.remove('active');
    tabCashContent.classList.add('active');
    tabInventoryContent.classList.remove('active');
    state.activeTab = 'cash';
    
    if (state.activeReporterId) {
      cashReporterSelect.value = state.activeReporterId;
      const emp = state.employees.find(e => e.id === state.activeReporterId);
      if (emp) cashReportShiftSelect.value = emp.defaultShift;
    }
    updateCashCalculation();

    // Focus and select the first input field (500k) automatically!
    setTimeout(() => {
      const firstInput = document.getElementById('input-bill-500000');
      if (firstInput) {
        firstInput.focus();
        try {
          firstInput.select();
        } catch (err) {}
      }
    }, 100);
  });

  // Category select
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-category');
      renderDrinksMenu();
    });
  });

  // Search filter typing
  drinkSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDrinksMenu();
  });

  // Add Employee
  addEmployeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = employeeNameInput.value.trim();
    const shift = employeeShiftSelect.value;
    
    if (!name) return;

    const newEmployee = {
      id: 'emp_' + Date.now(),
      name: name,
      defaultShift: shift,
      avatar: state.selectedAvatarIndex
    };

    state.employees.push(newEmployee);
    state.activeReporterId = newEmployee.id;

    employeeNameInput.value = '';
    await saveDatabase();
    
    renderActiveEmployees();
    updateStats();
    
    validateBulkReportForm();
  });

  // Bulk Inventory Report Form Submission
  bulkReportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const empId = reporterSelect.value;
    const shift = reportShiftSelect.value;
    const notes = reportNotesInput.value.trim();

    if (!empId) {
      alert('Vui lòng chọn nhân viên báo cáo trước!');
      reporterSelect.focus();
      return;
    }

    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    const modifiedCodes = Object.keys(state.tempReports);
    if (modifiedCodes.length === 0) return;

    // Process all modified products in tempReports
    for (const code of modifiedCodes) {
      const temp = state.tempReports[code];
      const product = PRODUCTS.find(p => p.code === code);
      if (!product) continue;

      const newReport = {
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        time: new Date().toISOString(),
        employeeId: emp.id,
        employeeName: emp.name,
        shift: shift,
        productCode: product.code,
        productName: product.name,
        productCat: product.category,
        qty: temp.qty,
        type: temp.type,
        notes: notes || 'Kiểm kho hàng ngày'
      };

      if (window.api && window.api.addReportSecure) {
        const actor = state.employees.find(e => e.id === state.activeReporterId) || emp;
        await window.api.addReportSecure(newReport, actor);
      } else {
        state.reports.push(newReport);
      }
    }

    // Clear temp reports and reset form
    state.tempReports = {};
    reportNotesInput.value = '';
    
    if (!window.api || !window.api.addReportSecure) {
      await saveDatabase();
    } else {
      await loadDatabase(); // Tải lại database đã chốt lưu an toàn
    }
    
    // Refresh UI
    updateStats();
    renderReportsTable();
    renderHandoverSummaryTable();
    renderDrinksMenu();
    updateBulkReportSummary();
    renderActiveEmployees(); // Cập nhật lại chỉ số rủi ro
    
    alert(`Đã lưu thành công báo cáo kiểm kho của ${modifiedCodes.length} sản phẩm!`);
  });

  // Change active reporter selection dropdowns
  reporterSelect.addEventListener('change', async () => {
    if (state.isProgrammaticChange) return;
    const empId = reporterSelect.value;
    if (empId) {
      const emp = state.employees.find(e => e.id === empId);
      if (emp) {
        if (window.api && window.api.verifyPin) {
          const pin = await showPinPrompt(`Nhập mã PIN của nhân viên ${emp.name} để trực ca (mặc định: 1234):`);
          if (pin === null) {
            state.isProgrammaticChange = true;
            reporterSelect.value = state.activeReporterId || '';
            state.isProgrammaticChange = false;
            return;
          }
          const isValid = await window.api.verifyPin(emp.id, pin);
          if (!isValid) {
            alert('Sai mã PIN! Chuyển đổi ca trực thất bại.');
            state.isProgrammaticChange = true;
            reporterSelect.value = state.activeReporterId || '';
            state.isProgrammaticChange = false;
            return;
          }
        }
        state.isProgrammaticChange = true;
        state.activeReporterId = emp.id;
        reportShiftSelect.value = emp.defaultShift;
        cashReporterSelect.value = emp.id;
        cashReportShiftSelect.value = emp.defaultShift;
        renderActiveEmployees();
        state.isProgrammaticChange = false;
      }
    }
    validateBulkReportForm();
  });

  cashReporterSelect.addEventListener('change', async () => {
    if (state.isProgrammaticChange) return;
    const empId = cashReporterSelect.value;
    if (empId) {
      const emp = state.employees.find(e => e.id === empId);
      if (emp) {
        if (window.api && window.api.verifyPin) {
          const pin = await showPinPrompt(`Nhập mã PIN của nhân viên ${emp.name} để bàn giao (mặc định: 1234):`);
          if (pin === null) {
            state.isProgrammaticChange = true;
            cashReporterSelect.value = state.activeReporterId || '';
            state.isProgrammaticChange = false;
            return;
          }
          const isValid = await window.api.verifyPin(emp.id, pin);
          if (!isValid) {
            alert('Sai mã PIN! Bàn giao ca trực thất bại.');
            state.isProgrammaticChange = true;
            cashReporterSelect.value = state.activeReporterId || '';
            state.isProgrammaticChange = false;
            return;
          }
        }
        state.isProgrammaticChange = true;
        state.activeReporterId = emp.id;
        cashReportShiftSelect.value = emp.defaultShift;
        reporterSelect.value = emp.id;
        reportShiftSelect.value = emp.defaultShift;
        renderActiveEmployees();
        state.isProgrammaticChange = false;
      }
    }
  });

  // Table logs filter dropdowns
  filterShiftSelect.addEventListener('change', () => {
    state.filters.shift = filterShiftSelect.value;
    renderReportsTable();
    renderHandoverSummaryTable();
  });

  filterStaffSelect.addEventListener('change', () => {
    state.filters.employee = filterStaffSelect.value;
    renderReportsTable();
    renderHandoverSummaryTable();
  });

  filterTypeSelect.addEventListener('change', () => {
    state.filters.type = filterTypeSelect.value;
    renderReportsTable();
    renderHandoverSummaryTable();
  });

  btnClearFilters.addEventListener('click', () => {
    state.filters.shift = 'all';
    state.filters.employee = 'all';
    state.filters.type = 'all';
    
    filterShiftSelect.value = 'all';
    filterStaffSelect.value = 'all';
    filterTypeSelect.value = 'all';
    
    renderReportsTable();
    renderHandoverSummaryTable();
  });

  // ==========================================
  // CASH COUNT EVENTS
  // ==========================================
  btnResetCashCount.addEventListener('click', () => {
    resetCashCalculator();
  });

  systemCashInput.addEventListener('input', () => {
    const selectionStart = systemCashInput.selectionStart;
    const originalLen = systemCashInput.value.length;
    const raw = systemCashInput.value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (raw) {
      formatted = new Intl.NumberFormat('vi-VN').format(parseInt(raw));
    }
    systemCashInput.value = formatted;
    const newLen = formatted.length;
    const diff = newLen - originalLen;
    let newCursorPos = selectionStart + diff;
    if (newCursorPos < 0) newCursorPos = 0;
    try {
      systemCashInput.setSelectionRange(newCursorPos, newCursorPos);
    } catch (err) {}

    const totalCounted = Object.keys(state.cashCounts).reduce((total, val) => {
      return total + (state.cashCounts[val] * parseInt(val));
    }, 0);
    updateDiscrepancy(totalCounted);
  });
  
  systemCashInput.addEventListener('focus', () => {
    try {
      systemCashInput.select();
    } catch (err) {}
  });

  // Nút xác nhận đã chuyển khoản
  const btnConfirmTransfer = document.getElementById('btnConfirmTransfer');
  if (btnConfirmTransfer) {
    btnConfirmTransfer.addEventListener('click', () => {
      state.transferConfirmed = true;
      // Refresh UI state
      const totalCounted = Object.keys(state.cashCounts).reduce((total, val) => {
        return total + (state.cashCounts[val] * parseInt(val));
      }, 0);
      updateDiscrepancy(totalCounted);
    });
  }

  btnCopyCashReport.addEventListener('click', () => {
    copyCashReportToClipboard();
  });

  cashReportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const empId = cashReporterSelect.value;
    const shift = cashReportShiftSelect.value;
    const sysVal = parseInt((systemCashInput.value || '').replace(/[^0-9]/g, '')) || 0;
    const notes = cashReportNotes.value.trim();

    if (!empId) {
      alert('Vui lòng chọn nhân viên bàn giao kết ca!');
      return;
    }

    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    const totalCounted = Object.keys(state.cashCounts).reduce((total, val) => {
      return total + (state.cashCounts[val] * parseInt(val));
    }, 0);

    const discrepancy = totalCounted - sysVal;
    const transferAmount = discrepancy < 0 ? Math.abs(discrepancy) : 0;

    // Nếu thiếu tiền mà chưa xác nhận chuyển khoản
    if (transferAmount > 0 && !state.transferConfirmed) {
      alert('Bạn cần QUÉT QR và bấm "ĐÃ CHUYỂN KHOẢN" trước khi lưu kết ca!');
      return;
    }

    // Xác định trạng thái khớp tiền
    let reconcileStatus = 'khớp';
    if (discrepancy > 0) reconcileStatus = 'thừa';
    else if (discrepancy < 0 && state.transferConfirmed) reconcileStatus = 'da_ck';
    else if (discrepancy < 0) reconcileStatus = 'thieu';

    const newCashLog = {
      id: 'cash_' + Date.now(),
      time: new Date().toISOString(),
      employeeId: emp.id,
      employeeName: emp.name,
      shift: shift,
      counts: { ...state.cashCounts },
      totalCash: totalCounted,
      systemCash: sysVal,
      transferAmount: transferAmount,
      reconcileStatus: reconcileStatus,
      notes: notes
    };

    state.cashLogs.push(newCashLog);
    await saveDatabase();
    renderCashLogsTable();
    resetCashCalculator();
    alert(`Đã lưu kết ca thành công!${transferAmount > 0 ? ` Chuyển khoản: ${formatCurrency(transferAmount)}đ` : ''}`);
  });

  // Modal controls
  btnOpenDocs.addEventListener('click', (e) => {
    e.preventDefault();
    instructionModal.classList.add('open');
  });

  btnCloseModal.addEventListener('click', () => {
    instructionModal.classList.remove('open');
  });

  instructionModal.addEventListener('click', (e) => {
    if (e.target === instructionModal) {
      instructionModal.classList.remove('open');
    }
  });

  // Đăng ký sự kiện nút Đổi PIN
  document.getElementById('btnChangePin').addEventListener('click', async () => {
    if (!state.activeReporterId) {
      alert('Vui lòng chọn nhân viên trực ca hiện tại trước khi đổi PIN!');
      return;
    }
    
    const emp = state.employees.find(e => e.id === state.activeReporterId);
    if (!emp) return;

    if (!window.api || !window.api.updatePin) {
      alert('Tính năng đổi mã PIN bảo mật chỉ khả dụng trên phiên bản Desktop Electron.');
      return;
    }

    const oldPin = await showPinPrompt(`Nhập mã PIN hiện tại của nhân viên ${emp.name} (mặc định là 1234 nếu chưa đổi):`);
    if (oldPin === null) return;

    const newPin = await showPinPrompt(`Nhập mã PIN mới (chuỗi gồm 4 chữ số):`);
    if (newPin === null) return;

    if (newPin.length < 4 || isNaN(newPin)) {
      alert('Mã PIN mới không hợp lệ! Vui lòng nhập mã PIN là chuỗi gồm ít nhất 4 chữ số.');
      return;
    }

    const success = await window.api.updatePin(emp.id, oldPin, newPin);
    if (success) {
      alert('Thay đổi mã PIN đăng nhập thành công!');
    } else {
      alert('Đổi mã PIN thất bại! Mã PIN hiện tại bạn nhập không đúng.');
    }
  });

  // Đăng ký sự kiện Sub-Tab Giao ca & Chi tiết
  const btnSubTabHandover = document.getElementById('btnSubTabHandover');
  const btnSubTabDetailed = document.getElementById('btnSubTabDetailed');
  const handoverSummaryTableWrapper = document.getElementById('handoverSummaryTableWrapper');
  const detailedReportsTableWrapper = document.getElementById('detailedReportsTableWrapper');
  const tableSectionTitle = document.getElementById('tableSectionTitle');

  btnSubTabHandover.addEventListener('click', () => {
    btnSubTabHandover.classList.add('active');
    btnSubTabDetailed.classList.remove('active');
    handoverSummaryTableWrapper.style.display = 'block';
    detailedReportsTableWrapper.style.display = 'none';
    tableSectionTitle.textContent = 'BẢNG TỔNG HỢP BÀN GIAO CA (LỆCH NƯỚC)';
    
    // Hide employee/type filters since summary only needs shift filter
    document.querySelectorAll('.detailed-filter-only').forEach(el => el.style.display = 'none');
  });

  btnSubTabDetailed.addEventListener('click', () => {
    btnSubTabDetailed.classList.add('active');
    btnSubTabHandover.classList.remove('active');
    detailedReportsTableWrapper.style.display = 'block';
    handoverSummaryTableWrapper.style.display = 'none';
    tableSectionTitle.textContent = 'BẢNG CHI TIẾT BÁO CÁO TRONG NGÀY';
    
    // Show employee/type filters for detailed view
    document.querySelectorAll('.detailed-filter-only').forEach(el => el.style.display = 'block');
  });
}

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encodings
  str = str.replace(/\u0300|\u0301|\u0309|\u0303|\u0323/g, ""); // Huyen sac hoi nga nang
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ă, Ơ
  return str;
}

function renderHandoverSummaryTable() {
  const tableBody = document.getElementById('handoverSummaryTableBody');
  const emptyState = document.getElementById('emptyHandoverTableState');
  
  if (!tableBody) return;
  tableBody.innerHTML = '';
  
  // Lấy danh sách báo cáo nước uống theo bộ lọc ca trực hiện tại
  const selectedShift = state.filters.shift; // 'all' hoặc ca cụ thể
  
  const filteredReports = state.reports.filter(r => {
    const matchShift = selectedShift === 'all' || r.shift === selectedShift;
    return matchShift;
  });
  
  // Gom nhóm theo productCode
  const summaryMap = {};
  
  filteredReports.forEach(r => {
    if (!summaryMap[r.productCode]) {
      const prod = PRODUCTS.find(p => p.code === r.productCode) || { name: r.productName, category: r.productCat };
      summaryMap[r.productCode] = {
        productName: prod.name,
        productCat: prod.category,
        totalMissing: 0,
        totalExcess: 0
      };
    }
    
    if (r.type === 'thiếu') {
      summaryMap[r.productCode].totalMissing += r.qty;
    } else if (r.type === 'dư') {
      summaryMap[r.productCode].totalExcess += r.qty;
    }
  });
  
  const summaryList = [];
  Object.keys(summaryMap).forEach(code => {
    const item = summaryMap[code];
    const balance = item.totalExcess - item.totalMissing;
    if (balance !== 0) {
      summaryList.push({
        code,
        ...item,
        balance
      });
    }
  });
  
  if (summaryList.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  summaryList.forEach(item => {
    const tr = document.createElement('tr');
    
    const balanceText = item.balance < 0 
      ? `<span class="status-badge status-missing" style="font-weight: 700;">Thiếu ${Math.abs(item.balance)} chai</span>` 
      : `<span class="status-badge status-excess" style="font-weight: 700;">Dư +${item.balance} chai</span>`;
      
    tr.innerHTML = `
      <td><strong>${item.productName}</strong></td>
      <td><span style="font-size: 0.85rem; color: var(--text-muted);">${getFriendlyCategoryName(item.productCat)}</span></td>
      <td class="text-center text-pink" style="font-weight: 600;">${item.totalMissing > 0 ? item.totalMissing : '---'}</td>
      <td class="text-center text-neon-green" style="font-weight: 600;">${item.totalExcess > 0 ? item.totalExcess : '---'}</td>
      <td class="text-center">${balanceText}</td>
    `;
    
    tableBody.appendChild(tr);
  });
}
