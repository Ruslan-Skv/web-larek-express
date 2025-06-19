import cron from 'cron';
import fs from 'fs';
import path from 'path';

const tempDir = path.join(__dirname, '../../uploads/temp');

// Очистка файлов старше 24 часов
const cleanTempFiles = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err;

    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stat) => {
        if (err) return;

        if (now - stat.mtime.getTime() > dayInMs) {
          fs.unlink(filePath, err => {
            if (err) console.error(`Error deleting file ${filePath}:`, err);
            else console.log(`Deleted temp file: ${filePath}`);
          });
        }
      });
    });
  });
};

// Запускаем очистку каждый день в 3:00
const job = new cron.CronJob('0 3 * * *', cleanTempFiles);
job.start();
