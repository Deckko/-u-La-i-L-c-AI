import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target Directories & Files
const BASE_DIR = __dirname;
const CONFIG_FILE = path.join(BASE_DIR, 'report_config.json');
const SOURCE_CODE_DIR = path.join(BASE_DIR, '04_Project_Source');
const REPORT_DIR = path.join(BASE_DIR, 'BaoCaoInAn');
const TEMPLATE_FILE = path.join(REPORT_DIR, 'BaoCaoInAn_TongHop.template.md');
const OUTPUT_FILE = path.join(REPORT_DIR, 'BaoCaoInAn_TongHop.md');
const HTML_OUTPUT_FILE = path.join(REPORT_DIR, 'BaoCaoInAn_TongHop.html');

console.log('=== KHỞI ĐỘNG HỆ THỐNG BIÊN DỊCH BÁO CÁO TỐT NGHIỆP ===');

// 1. Load Configurations
if (!fs.existsSync(CONFIG_FILE)) {
  console.error(`[ERROR] Không tìm thấy tệp cấu hình ${CONFIG_FILE}`);
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
console.log(`[INFO] Đã nạp cấu hình thành công:`);
console.log(` - Sinh viên 1: ${config.students[0]?.name} (${config.students[0]?.mssv})`);
console.log(` - Giảng viên hướng dẫn: ${config.advisor}`);

// 2. Scan and Extract Metrics from Source Code (04_Project_Source)
console.log('\n[INFO] Đang quét mã nguồn dự án Next.js tại 04_Project_Source để trích xuất dữ liệu...');

function countFilesInDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return 0;
    return fs.readdirSync(dirPath).filter(file => {
      const stats = fs.statSync(path.join(dirPath, file));
      return stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'));
    }).length;
  } catch (e) {
    return 0;
  }
}

// Counts of UI components
const atomsCount = countFilesInDir(path.join(SOURCE_CODE_DIR, 'src', 'components', 'atoms'));
const moleculesCount = countFilesInDir(path.join(SOURCE_CODE_DIR, 'src', 'components', 'molecules'));
const organismsCount = countFilesInDir(path.join(SOURCE_CODE_DIR, 'src', 'components', 'organisms'));

// Hooks list
const hooksPath = path.join(SOURCE_CODE_DIR, 'src', 'hooks');
let hooksList = [];
if (fs.existsSync(hooksPath)) {
  hooksList = fs.readdirSync(hooksPath)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .map(file => `\`${file}\``);
}

// Pages list (routes)
const appPath = path.join(SOURCE_CODE_DIR, 'src', 'app');
let routesList = [];
function findPages(dir, currentRoute = '') {
  try {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const nextRoute = item.startsWith('(') && item.endsWith(')') ? currentRoute : `${currentRoute}/${item}`;
        findPages(fullPath, nextRoute);
      } else if (stat.isFile() && item === 'page.tsx') {
        routesList.push(`\`${currentRoute || '/'}\``);
      }
    }
  } catch (e) {}
}
findPages(appPath);

// Count products in mock file
let productsCount = 0;
const mockProductsFile = path.join(SOURCE_CODE_DIR, 'src', 'data', 'mockProducts.ts');
if (fs.existsSync(mockProductsFile)) {
  const content = fs.readFileSync(mockProductsFile, 'utf8');
  const matches = content.match(/id:\s*['"]p\d+['"]/g);
  if (matches) productsCount = matches.length;
}

console.log(`[INFO] Trích xuất thành công:`);
console.log(` - UI Components: ${atomsCount} Atoms, ${moleculesCount} Molecules, ${organismsCount} Organisms`);
console.log(` - Custom Hooks: ${hooksList.join(', ')}`);
console.log(` - Route Pages: ${routesList.join(', ')}`);
console.log(` - Danh mục sản phẩm: ${productsCount} sản phẩm`);

// 3. Compile the report by replacing variables
if (!fs.existsSync(TEMPLATE_FILE)) {
  console.error(`[ERROR] Không tìm thấy tệp mẫu báo cáo tại ${TEMPLATE_FILE}`);
  process.exit(1);
}

console.log('\n[INFO] Đang tiến hành biên dịch và thay thế dữ liệu Markdown...');
let reportContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Replace metadata
reportContent = reportContent
  .replace(/\{\{school\}\}/g, config.school)
  .replace(/\{\{faculty\}\}/g, config.faculty)
  .replace(/\{\{department\}\}/g, config.department)
  .replace(/\{\{occupation\}\}/g, config.occupation)
  .replace(/\{\{title\}\}/g, config.title)
  .replace(/\{\{student_1_name\}\}/g, config.students[0]?.name || '')
  .replace(/\{\{student_1_mssv\}\}/g, config.students[0]?.mssv || '')
  .replace(/\{\{student_1_class\}\}/g, config.students[0]?.class || '')
  .replace(/\{\{student_2_name\}\}/g, config.students[1]?.name || '')
  .replace(/\{\{student_2_mssv\}\}/g, config.students[1]?.mssv || '')
  .replace(/\{\{student_2_class\}\}/g, config.students[1]?.class || '')
  .replace(/\{\{advisor\}\}/g, config.advisor)
  .replace(/\{\{company\}\}/g, config.company)
  .replace(/\{\{company_address\}\}/g, config.companyAddress)
  .replace(/\{\{supervisor\}\}/g, config.supervisor)
  .replace(/\{\{supervisor_phone\}\}/g, config.supervisorPhone)
  .replace(/\{\{internship_period\}\}/g, config.internshipPeriod)
  .replace(/\{\{year\}\}/g, config.year)
  .replace(/\{\{location\}\}/g, config.location);

// Replace extracted code metrics
reportContent = reportContent
  .replace(/\{\{CODE_METADATA_ATOMS\}\}/g, atomsCount)
  .replace(/\{\{CODE_METADATA_MOLECULES\}\}/g, moleculesCount)
  .replace(/\{\{CODE_METADATA_ORGANISMS\}\}/g, organismsCount)
  .replace(/\{\{CODE_METADATA_HOOKS\}\}/g, hooksList.join(', '))
  .replace(/\{\{CODE_METADATA_PAGES\}\}/g, routesList.join(', '))
  .replace(/\{\{CODE_METADATA_PRODUCTS_COUNT\}\}/g, productsCount);

// Save output MD
fs.writeFileSync(OUTPUT_FILE, reportContent, 'utf8');
console.log(`[SUCCESS] Đã biên dịch báo cáo Markdown thành công tại: ${OUTPUT_FILE}`);

// 4. Generate beautifully formatted HTML for Printing and Microsoft Word import
console.log('\n[INFO] Đang chuyển đổi báo cáo sang định dạng HTML chuẩn in ấn...');

function markdownToHtml(md) {
  let html = md;

  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `<!--CODE_BLOCK_${codeBlocks.length}-->`;
    codeBlocks.push({ lang, code: escapeHtml(code.trim()) });
    return placeholder;
  });

  html = html.replace(/\n(\|.*\|)\n(\|[-:| ]*\|)\n((?:\|.*\|\n?)*)/g, (match, header, separator, body) => {
    const headers = header.split('|').slice(1, -1).map(h => h.trim());
    const rows = body.trim().split('\n').map(row => row.split('|').slice(1, -1).map(r => r.trim()));
    
    let tableHtml = '<table class="academic-table">\n<thead>\n<tr>\n';
    headers.forEach(h => {
      tableHtml += `  <th>${h}</th>\n`;
    });
    tableHtml += '</tr>\n</thead>\n<tbody>\n';
    rows.forEach(row => {
      tableHtml += '<tr>\n';
      row.forEach(cell => {
        tableHtml += `  <td>${cell}</td>\n`;
      });
      tableHtml += '</tr>\n';
    });
    tableHtml += '</tbody>\n</table>\n';
    return '\n' + tableHtml + '\n';
  });

  html = html
    .replace(/\\newpage/g, '<div class="page-break"></div>')
    .replace(/^# (.*)$/gm, '<h1 class="chapter-title">$1</h1>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="image-container"><img src="$2" alt="$1"><p class="image-caption">$1</p></div>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  html = html.replace(/^\*\s(.*)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\s*)+)/g, '<ul>\n$1</ul>\n');

  const lines = html.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || 
        trimmed.startsWith('</h') ||
        trimmed.startsWith('<div') || 
        trimmed.startsWith('</div') ||
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('</ul') ||
        trimmed.startsWith('<li') || 
        trimmed.startsWith('</li') ||
        trimmed.startsWith('<table') || 
        trimmed.startsWith('</table') ||
        trimmed.startsWith('<thead') || 
        trimmed.startsWith('</thead') ||
        trimmed.startsWith('<tbody') || 
        trimmed.startsWith('</tbody') ||
        trimmed.startsWith('<tr') || 
        trimmed.startsWith('</tr') ||
        trimmed.startsWith('<th') || 
        trimmed.startsWith('</th') ||
        trimmed.startsWith('<td') || 
        trimmed.startsWith('</td') ||
        trimmed.startsWith('<!--') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('</pre')) {
      return line;
    }
    return `<p>${trimmed}</p>`;
  });
  html = parsedLines.join('\n');

  codeBlocks.forEach((block, index) => {
    const placeholder = `<!--CODE_BLOCK_${index}-->`;
    const blockHtml = `<pre class="code-block"><code class="language-${block.lang}">${block.code}</code></pre>`;
    html = html.replace(placeholder, blockHtml);
  });

  return html;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const bodyContent = markdownToHtml(reportContent);

const htmlTemplate = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${config.title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 30mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #000;
      background-color: #fff;
      margin: 0;
      padding: 0;
      text-align: justify;
    }
    .page-break {
      page-break-before: always;
      clear: both;
    }
    p {
      text-indent: 1.27cm;
      margin-top: 0;
      margin-bottom: 6pt;
    }
    h1.chapter-title {
      font-size: 16pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin-top: 0;
      margin-bottom: 24pt;
      page-break-before: always;
    }
    h1.chapter-title:first-of-type {
      page-break-before: avoid;
    }
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 18pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 13pt;
      font-weight: bold;
      font-style: italic;
      margin-top: 12pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }
    h4 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 6pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
    }
    ul {
      margin-top: 0;
      margin-bottom: 6pt;
      padding-left: 2cm;
    }
    li {
      margin-bottom: 3pt;
    }
    .academic-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      margin-bottom: 12pt;
      font-size: 12pt;
      page-break-inside: avoid;
    }
    .academic-table th, .academic-table td {
      border: 1px solid #000;
      padding: 6px 10px;
      text-align: left;
    }
    .academic-table th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    .code-block {
      background-color: #f5f5f5;
      border: 1px solid #ccc;
      padding: 10px;
      font-family: Consolas, "Courier New", monospace;
      font-size: 10pt;
      line-height: 1.2;
      overflow-x: auto;
      margin-top: 12pt;
      margin-bottom: 12pt;
      page-break-inside: avoid;
      white-space: pre-wrap;
    }
    .image-container {
      text-align: center;
      margin-top: 12pt;
      margin-bottom: 12pt;
      page-break-inside: avoid;
    }
    .image-container img {
      max-width: 80%;
      height: auto;
      border: 1px solid #ddd;
    }
    .image-caption {
      font-size: 11pt;
      font-style: italic;
      margin-top: 6pt;
      text-indent: 0;
      text-align: center;
    }
    a {
      color: #000;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="padding: 10mm;">
    ${bodyContent}
  </div>
</body>
</html>
`;

fs.writeFileSync(HTML_OUTPUT_FILE, htmlTemplate, 'utf8');
console.log(`[SUCCESS] Đã biên dịch báo cáo HTML thành công tại: ${HTML_OUTPUT_FILE}`);
console.log('========================================================');
