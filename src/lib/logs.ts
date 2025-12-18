
'use client';
import { getCurrentUser } from './auth';
import type { UserLog } from './types';

const LOGS_KEY = 'user_logs';

export const getLogs = (): UserLog[] => {
    if (typeof window === 'undefined') {
        return [];
    }
    const logsJson = localStorage.getItem(LOGS_KEY);
    if (logsJson) {
        try {
            return JSON.parse(logsJson);
        } catch (e) {
            console.error("Failed to parse logs from localStorage", e);
            return [];
        }
    }
    return [];
};

export const addLog = (action: string, details?: Record<string, any>): void => {
    if (typeof window === 'undefined') {
        return;
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Don't log actions if no user is logged in, or log as 'System'
        return;
    }

    const logs = getLogs();
    const newLog: UserLog = {
        id: String(Date.now()),
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        timestamp: new Date().toISOString(),
        details,
    };
    
    logs.unshift(newLog); // Add to the beginning of the array
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 500))); // Keep last 500 logs
};

export const clearLogs = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(LOGS_KEY);
    }
};
