import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class JsonDbService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly cache;
    private readonly writeTimers;
    private readonly WRITE_DEBOUNCE_MS;
    private get dataDir();
    onModuleInit(): Promise<void>;
    private warmUpCache;
    get<T>(key: string): T;
    set(key: string, data: any): void;
    private scheduleDiskWrite;
    private writeToDisk;
    getFilesDir(subPath?: string): string;
    onModuleDestroy(): Promise<void>;
}
