export type HealthOutputDocument = {
    status: string;
    version: string;
    timestamp: Date;
    uptimeSeconds: number;
    nodeVersion: string;
    blockChainHistory?: BlockChainHistoryHealthDocument;
    dependencies?: PackagedDependency[];
    database: DatabaseHealthDocument;
    [key: string]: unknown;
};

export type BlockChainHistoryHealthDocument = {
    currentBlock: bigint;
};

export type PackagedDependency = {
    name: string;
    version: string;
};

export type DatabaseHealthDocument = {
    status: string;
};