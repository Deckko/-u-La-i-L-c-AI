const fs = require('fs');
const crypto = require('crypto');

class StorageService {
  constructor(storageDir) {
    this.storageDir = storageDir;
    this.algorithm = 'aes-256-cbc';
    // Khóa mã hóa tĩnh cố định (để giải mã ổn định trên mọi máy trạm chạy offline)
    this.key = crypto.scryptSync('CyberNetCafeHubSecretKey2026', 'salt', 32);
    this.iv = Buffer.alloc(16, 0); 
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText) {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      console.error('Lỗi giải mã tệp (Có thể tệp đã bị chỉnh sửa thủ công từ bên ngoài):', err.message);
      throw new Error('FILE_TAMPERED');
    }
  }

  // Ghi tệp nguyên tử (Atomic Write)
  async saveFileAtomic(filePath, data) {
    const tempPath = filePath + '.tmp';
    const rawData = JSON.stringify(data, null, 2);
    const encryptedData = this.encrypt(rawData);

    return new Promise((resolve, reject) => {
      fs.writeFile(tempPath, encryptedData, 'utf8', (err) => {
        if (err) return reject(err);

        fs.rename(tempPath, filePath, (renameErr) => {
          if (renameErr) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            return reject(renameErr);
          }
          resolve(true);
        });
      });
    });
  }

  // Đọc tệp giải mã (Tự động di trú file thô cũ sang file mã hóa mới)
  readFileDecrypted(filePath, defaultValue = []) {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (!content) return defaultValue;
      
      // Auto-migrate: nếu file bắt đầu bằng { hoặc [ (chưa mã hóa), đọc thô và lưu đè mã hóa
      if (content.startsWith('{') || content.startsWith('[')) {
        console.log(`[Auto-Migrate] Phát hiện file JSON thô, tự động mã hóa: ${filePath}`);
        try {
          const parsed = JSON.parse(content);
          this.saveFileAtomic(filePath, parsed);
          return parsed;
        } catch (jsonErr) {
          console.error(`Lỗi phân tích cú pháp JSON thô: ${filePath}`, jsonErr);
          return defaultValue;
        }
      }

      const decryptedJson = this.decrypt(content);
      return JSON.parse(decryptedJson);
    } catch (err) {
      console.error(`Lỗi nạp file giải mã ${filePath}:`, err.message);
      return defaultValue;
    }
  }
}

module.exports = StorageService;
