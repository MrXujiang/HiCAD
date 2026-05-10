"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JsonDbService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonDbService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
let JsonDbService = JsonDbService_1 = class JsonDbService {
    constructor() {
        this.logger = new common_1.Logger(JsonDbService_1.name);
        this.cache = new Map();
        this.writeTimers = new Map();
        this.WRITE_DEBOUNCE_MS = 2000;
    }
    get dataDir() {
        return path.resolve(process.env.DATA_DIR || './data');
    }
    async onModuleInit() {
        await fs.mkdir(this.dataDir, { recursive: true });
        await fs.mkdir(path.join(this.dataDir, 'files'), { recursive: true });
        await this.warmUpCache();
        this.logger.log(`JSON DB initialized at ${this.dataDir}`);
    }
    async warmUpCache() {
        const schemas = {
            users: { users: [] },
            models: { models: [] },
            templates: { templates: [] },
            sessions: { sessions: [] },
            orders: { orders: [] },
            feedbacks: { feedbacks: [] },
        };
        for (const [name, initial] of Object.entries(schemas)) {
            const filePath = path.join(this.dataDir, `${name}.json`);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                this.cache.set(name, JSON.parse(content));
            }
            catch {
                this.cache.set(name, initial);
                await this.writeToDisk(name, initial);
            }
        }
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, data) {
        this.cache.set(key, data);
        this.scheduleDiskWrite(key);
    }
    scheduleDiskWrite(key) {
        if (this.writeTimers.has(key)) {
            clearTimeout(this.writeTimers.get(key));
        }
        const timer = setTimeout(async () => {
            try {
                await this.writeToDisk(key, this.cache.get(key));
                this.writeTimers.delete(key);
            }
            catch (err) {
                this.logger.error(`Failed to write ${key}.json: ${err}`);
            }
        }, this.WRITE_DEBOUNCE_MS);
        this.writeTimers.set(key, timer);
    }
    async writeToDisk(key, data) {
        const filePath = path.join(this.dataDir, `${key}.json`);
        const tmpPath = `${filePath}.tmp`;
        await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
        await fs.rename(tmpPath, filePath);
    }
    getFilesDir(subPath = '') {
        return path.join(this.dataDir, 'files', subPath);
    }
    async onModuleDestroy() {
        for (const [key, timer] of this.writeTimers.entries()) {
            clearTimeout(timer);
            try {
                await this.writeToDisk(key, this.cache.get(key));
            }
            catch { }
        }
    }
};
exports.JsonDbService = JsonDbService;
exports.JsonDbService = JsonDbService = JsonDbService_1 = __decorate([
    (0, common_1.Injectable)()
], JsonDbService);
//# sourceMappingURL=json-db.service.js.map