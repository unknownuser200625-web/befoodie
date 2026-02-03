import * as fs from 'node:fs';
import * as path from 'node:path';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Use global singleton to share state across CJS/ESM and Server/App contexts
const globalForDB = global as unknown as { dbMemory: any };

export function getDB() {
    if (globalForDB.dbMemory) return globalForDB.dbMemory;

    if (fs.existsSync(DB_FILE)) {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            globalForDB.dbMemory = JSON.parse(data);
            return globalForDB.dbMemory;
        } catch (e) {
            console.error('Failed to parse DB', e);
        }
    }

    // Default initial state
    globalForDB.dbMemory = {
        products: [],
        categories: [],
        activeSessionId: '',
        sessions: {},
        history: [],
        isSystemOpen: false
    };
    return globalForDB.dbMemory;
}

export function saveDB(data?: any) {
    if (data) globalForDB.dbMemory = data;
    if (!globalForDB.dbMemory) return;

    fs.writeFileSync(DB_FILE, JSON.stringify(globalForDB.dbMemory, null, 2));
}

// Helper to initialize session if missing
export function ensureSession() {
    const db = getDB();
    if (!db.activeSessionId) {
        const today = new Date().toISOString().split('T')[0];
        db.activeSessionId = today;
        if (!db.sessions) db.sessions = {};
        if (!db.sessions[today]) {
            db.sessions[today] = { orders: [], tableSessions: [] };
        }
        saveDB();
    }
    return db;
}
