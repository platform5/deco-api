import fs from 'fs';
import { resolve } from 'path';

export class FileHelper {
  static removeFromDisk(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}