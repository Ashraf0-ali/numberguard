
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

// Load contacts from localStorage
export const loadContactsFromStorage = (userId?: string): Contact[] => {
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId));
    if (stored) {
      const parsedContacts = JSON.parse(stored);
      return parsedContacts.sort((a: Contact, b: Contact) => {
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

// Save contacts to localStorage
export const saveContactsToStorage = (contacts: Contact[], userId?: string) => {
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(contacts));
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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
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

// Save sync errors
export const saveSyncError = (error: any, operationId: string, userId?: string) => {
  try {
    const errorKey = getSyncErrorKey(userId);
    const existingErrors = JSON.parse(localStorage.getItem(errorKey) || '{}');
    existingErrors[operationId] = {
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      operationId
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
    return JSON.parse(localStorage.getItem(errorKey) || '{}');
  } catch (error) {
    console.error('Error getting sync errors:', error);
    return {};
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
