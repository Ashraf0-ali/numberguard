
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { getSyncErrors, clearSyncErrors, clearSyncError } from '@/utils/storageUtils';
import { useAuth } from '@/hooks/useAuth';

interface SyncError {
  message: string;
  timestamp: string;
  operationId: string;
}

interface SyncErrorsMap {
  [key: string]: SyncError;
}

export function useSyncNotification() {
  const [syncErrors, setSyncErrors] = useState<SyncErrorsMap>({});
  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const { user } = useAuth();
  
  // Load sync errors from localStorage
  useEffect(() => {
    if (!user) return;
    
    const checkSyncErrors = () => {
      const errors = getSyncErrors(user.uid);
      setSyncErrors(errors);
      setHasSyncErrors(Object.keys(errors).length > 0);
    };
    
    // Check initially
    checkSyncErrors();
    
    // Set up periodic checking
    const intervalId = setInterval(checkSyncErrors, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);
  
  // Show toast notification for sync errors
  useEffect(() => {
    if (hasSyncErrors) {
      toast({
        title: "Sync Error",
        description: "Some changes couldn't be synced. They'll retry when connection improves.",
        variant: "destructive",
      });
    }
  }, [hasSyncErrors]);
  
  // Listen for messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_NEEDED') {
        // Attempt to sync when service worker requests it
        window.dispatchEvent(new CustomEvent('attemptSync'));
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Clear a specific sync error
  const clearError = (operationId: string) => {
    if (!user) return;
    clearSyncError(operationId, user.uid);
    const updatedErrors = { ...syncErrors };
    delete updatedErrors[operationId];
    setSyncErrors(updatedErrors);
    setHasSyncErrors(Object.keys(updatedErrors).length > 0);
  };
  
  // Clear all sync errors
  const clearAllErrors = () => {
    if (!user) return;
    clearSyncErrors(user.uid);
    setSyncErrors({});
    setHasSyncErrors(false);
  };
  
  return {
    syncErrors,
    hasSyncErrors,
    clearError,
    clearAllErrors
  };
}
