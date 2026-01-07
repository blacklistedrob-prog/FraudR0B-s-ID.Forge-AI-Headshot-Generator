import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { AgentMode } from '../types';

// Initialize plugins safely
try {
  addRxPlugin(RxDBQueryBuilderPlugin);
} catch (e) {
  // Plugin might be already added in dev/HMR environment
  console.warn("RxDB Plugin re-initialization skipped");
}

const OPERATIONS_SCHEMA = {
    title: 'operations schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100 // Primary key needs length
        },
        timestamp: {
            type: 'number'
        },
        type: {
            type: 'string',
            enum: ['GENERATION', 'SCAN', 'EDIT']
        },
        mode: {
            type: 'string'
        },
        imageData: {
            type: 'string' // Base64
        },
        prompt: {
            type: 'string'
        },
        forensicScore: {
            type: 'number'
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            }
        }
    },
    required: ['id', 'timestamp', 'type', 'imageData']
};

let dbPromise: any = null;

const createDatabase = async () => {
    console.log("Initializing Agent Memory Bank (RxDB + Dexie)...");
    
    // Create the database
    const db = await createRxDatabase({
        name: 'idforge_memory_v1',
        storage: getRxStorageDexie(),
        ignoreDuplicate: true
    });

    // Create collections
    await db.addCollections({
        operations: {
            schema: OPERATIONS_SCHEMA
        }
    });

    console.log("Agent Memory Bank Online.");
    return db;
};

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = createDatabase();
    }
    return dbPromise;
};

// --- CRUD Operations ---

export const storeOperation = async (data: {
    type: 'GENERATION' | 'SCAN' | 'EDIT',
    mode?: AgentMode | string,
    imageData: string,
    prompt?: string,
    forensicScore?: number,
    tags?: string[]
}) => {
    try {
        const db = await getDB();
        const id = crypto.randomUUID();
        await db.operations.insert({
            id,
            timestamp: Date.now(),
            ...data
        });
        console.log(`[MEMORY] Operation ${id} archived.`);
        return id;
    } catch (e) {
        console.error("Failed to archive operation:", e);
    }
};

export const retrieveRecentOperations = async (limit = 20) => {
    try {
        const db = await getDB();
        const docs = await db.operations.find({
            sort: [{ timestamp: 'desc' }],
            limit: limit
        }).exec();
        return docs.map((d: any) => d.toJSON());
    } catch (e) {
        console.error("Memory retrieval failed:", e);
        return [];
    }
};

export const clearMemory = async () => {
    const db = await getDB();
    await db.operations.find().remove();
    console.log("Agent Memory Purged.");
};