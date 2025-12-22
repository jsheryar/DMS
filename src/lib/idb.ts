
'use client';
import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'DocuSafeDB';
const STORE_NAME = 'files';

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};


export const saveFile = async (id: string, file: File): Promise<void> => {
    const db = await getDb();
    await db.put(STORE_NAME, file, id);
};

export const getFile = async (id: string): Promise<File | undefined> => {
    const db = await getDb();
    return db.get(STORE_NAME, id);
};

export const deleteFile = async (id: string): Promise<void> => {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
};
