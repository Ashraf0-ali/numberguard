import { Contact } from '@/hooks/useContacts';

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

// Compress contact data for storage
const compressContact = (contact: Contact): any => {
  return {
    i: contact.id,
    n: contact.name,
    num: contact.number,
    s: contact.story || '',
    t: contact.tags || [],
    d: contact.date_added || '',
    sy: contact.synced || false
  };
};

// Decompress contact data from storage
const decompressContact = (compressed: any): Contact => {
  return {
    id: compressed.i,
    name: compressed.n,
    number: compressed.num,
    story: compressed.s,
    tags: compressed.t,
    date_added: compressed.d,
    synced: compressed.sy
  };
};

// Load contacts from localStorage with compression
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

// Save contacts to localStorage with compression
export const saveContactsToStorage = (contacts: Contact[], userId?: string) => {
  try {
    const compressed = contacts.map(compressContact);
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(compressed));
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

// Save sync errors with cleanup
export const saveSyncError = (error: any, operationId: string, userId?: string) => {
  try {
    const errorKey = getSyncErrorKey(userId);
    const existingErrors = JSON.parse(localStorage.getItem(errorKey) || '{}');
    
    // Keep only last 10 errors to prevent storage bloat
    const errorKeys = Object.keys(existingErrors);
    if (errorKeys.length >= 10) {
      const sortedKeys = errorKeys.sort((a, b) => {
        const aTime = existingErrors[a].timestamp || '0';
        const bTime = existingErrors[b].timestamp || '0';
        return aTime.localeCompare(bTime);
      });
      // Remove oldest errors
      sortedKeys.slice(0, errorKeys.length - 9).forEach(key => {
        delete existingErrors[key];
      });
    }
    
    existingErrors[operationId] = {
      m: error.message || 'Unknown error',
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

// Clean up old data periodically
export const cleanupStorage = (userId?: string) => {
  try {
    // Clean offline queue of very old items (older than 7 days)
    const queue = getOfflineQueue(userId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const cleanQueue = queue.filter(op => {
      const opDate = new Date(op.timestamp);
      return opDate > sevenDaysAgo;
    });
    
    if (cleanQueue.length !== queue.length) {
      saveOfflineQueue(cleanQueue, userId);
      console.log(`Cleaned ${queue.length - cleanQueue.length} old offline operations`);
    }
    
    // Clean old sync errors (already limited to 10 in saveSyncError)
    const errors = getSyncErrors(userId);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 10) {
      clearSyncErrors(userId);
      console.log('Cleaned old sync errors');
    }
    
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

// Register for sync with service worker
export const registerForSync = () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Send message to service worker to register for sync
      navigator.serviceWorker.controller?.postMessage({
        type: 'REGISTER_SYNC'
      });
    });
  }
};

// Get storage size estimate
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('numberguard_')) {
        total += localStorage[key].length;
      }
    }
    return Math.round(total / 1024); // Return size in KB
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};
