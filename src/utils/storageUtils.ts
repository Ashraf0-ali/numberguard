import { Contact } from '@/hooks/useContacts';
import { compressContact, decompressContact } from './storageCompression';

export const STORAGE_KEY_PREFIX = 'numberguard_contacts';
export const OFFLINE_QUEUE_KEY_PREFIX = 'numberguard_offline_queue';
export const SYNC_ERROR_KEY_PREFIX = 'numberguard_sync_errors';

// Get user-specific storage keys
export const getUserStorageKey = (userId?: string) => {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
};

export const getOfflineQueueKey = (userId?: string) => {
  return userId ? `${OFFLINE_QUEUE_KEY_PREFIX}_${userId}` : OFFLINE_QUEUE_KEY_PREFIX;
};

export const getSyncErrorKey = (userId?: string) => {
  return userId ? `${SYNC_ERROR_KEY_PREFIX}_${userId}` : SYNC_ERROR_KEY_PREFIX;
};

// Load contacts from localStorage with ultra-compression
export const loadContactsFromStorage = (userId?: string): Contact[] => {
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId));
    if (stored) {
      const compressed = JSON.parse(stored);
      const contacts = Array.isArray(compressed) ? compressed.map(decompressContact) : [];
      return contacts.sort((a: Contact, b: Contact) => {
        if (!a.date_added || !b.date_added) return 0;
        return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
      });
    }
    return [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

// Save contacts to localStorage with ultra-compression
export const saveContactsToStorage = (contacts: Contact[], userId?: string) => {
  try {
    const compressed = contacts.map(compressContact);
    const jsonString = JSON.stringify(compressed);
    
    // Log storage size for debugging
    console.log(`Saving ${contacts.length} contacts, compressed size: ${Math.round(jsonString.length / 1024 * 100) / 100} KB`);
    
    localStorage.setItem(getUserStorageKey(userId), jsonString);
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export interface OfflineOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  contactId?: string;
  contactData?: any;
  timestamp: string;
  retryCount?: number;
}

// Get offline operations queue
export const getOfflineQueue = (userId?: string): OfflineOperation[] => {
  try {
    const queue = localStorage.getItem(getOfflineQueueKey(userId));
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error getting offline queue:', error);
    return [];
  }
};

// Save offline operations queue
export const saveOfflineQueue = (queue: OfflineOperation[], userId?: string) => {
  try {
    localStorage.setItem(getOfflineQueueKey(userId), JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error saving offline queue:', error);
    return false;
  }
};

// Add operation to offline queue
export const addToOfflineQueue = (
  operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>, 
  userId?: string
) => {
  try {
    const existingQueue = getOfflineQueue(userId);
    const newOperation: OfflineOperation = {
      ...operation,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    existingQueue.push(newOperation);
    saveOfflineQueue(existingQueue, userId);
    return newOperation;
  } catch (error) {
    console.error('Error adding to offline queue:', error);
    return null;
  }
};

// Save sync errors with ultra-compression
export const saveSyncError = (error: any, operationId: string, userId?: string) => {
  try {
    const errorKey = getSyncErrorKey(userId);
    const existingErrors = JSON.parse(localStorage.getItem(errorKey) || '{}');
    
    // Keep only last 5 errors to prevent storage bloat
    const errorKeys = Object.keys(existingErrors);
    if (errorKeys.length >= 5) {
      const sortedKeys = errorKeys.sort((a, b) => {
        const aTime = existingErrors[a].t || '0';
        const bTime = existingErrors[b].t || '0';
        return aTime.localeCompare(bTime);
      });
      // Remove oldest errors
      sortedKeys.slice(0, errorKeys.length - 4).forEach(key => {
        delete existingErrors[key];
      });
    }
    
    existingErrors[operationId] = {
      m: (error.message || 'Unknown error').substring(0, 100), // Limit error message length
      t: new Date().toISOString(),
      o: operationId
    };
    localStorage.setItem(errorKey, JSON.stringify(existingErrors));
  } catch (error) {
    console.error('Error saving sync error:', error);
  }
};

// Clear sync errors
export const clearSyncErrors = (userId?: string) => {
  localStorage.removeItem(getSyncErrorKey(userId));
};

// Clear specific sync error
export const clearSyncError = (operationId: string, userId?: string) => {
  try {
    const errorKey = getSyncErrorKey(userId);
    const existingErrors = JSON.parse(localStorage.getItem(errorKey) || '{}');
    delete existingErrors[operationId];
    localStorage.setItem(errorKey, JSON.stringify(existingErrors));
  } catch (error) {
    console.error('Error clearing sync error:', error);
  }
};

// Get sync errors
export const getSyncErrors = (userId?: string) => {
  try {
    const errorKey = getSyncErrorKey(userId);
    const compressed = JSON.parse(localStorage.getItem(errorKey) || '{}');
    // Decompress error format
    const errors: any = {};
    Object.keys(compressed).forEach(key => {
      const comp = compressed[key];
      errors[key] = {
        message: comp.m,
        timestamp: comp.t,
        operationId: comp.o
      };
    });
    return errors;
  } catch (error) {
    console.error('Error getting sync errors:', error);
    return {};
  }
};

// Aggressive cleanup - remove everything older than 3 days
export const cleanupStorage = (userId?: string) => {
  try {
    // Clean offline queue of old items (older than 3 days)
    const queue = getOfflineQueue(userId);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const cleanQueue = queue.filter(op => {
      const opDate = new Date(op.timestamp);
      return opDate > threeDaysAgo;
    });
    
    if (cleanQueue.length !== queue.length) {
      saveOfflineQueue(cleanQueue, userId);
      console.log(`Cleaned ${queue.length - cleanQueue.length} old offline operations`);
    }
    
    // Always clean sync errors to keep them minimal
    clearSyncErrors(userId);
    
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

// Register for sync with service worker
export const registerForSync = () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      navigator.serviceWorker.controller?.postMessage({
        type: 'REGISTER_SYNC'
      });
    });
  }
};

// Get storage size estimate (simplified)
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('numberguard_')) {
        total += localStorage[key].length;
      }
    }
    return Math.round(total / 1024 * 100) / 100; // Return size in KB with 2 decimals
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};
