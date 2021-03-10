"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class FileHelper {
    static removeFromDisk(path) {
        return new Promise((resolve, reject) => {
            fs_1.default.unlink(path, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
exports.FileHelper = FileHelper;
//# sourceMappingURL=file.js.map