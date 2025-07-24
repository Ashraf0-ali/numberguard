import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { 
  loadContactsFromStorage,
  saveContactsToStorage,
  getOfflineQueue,
  addToOfflineQueue,
  saveOfflineQueue,
  saveSyncError,
  registerForSync
} from '@/utils/storageUtils';
import {
  addContactToFirebase,
  updateContactInFirebase,
  deleteContactFromFirebase,
  syncOfflineOperations,
  setupContactsListener
} from '@/utils/firebaseUtils';
import { useSyncNotification } from '@/hooks/useSyncNotification';
import { searchWithBanglishSupport } from '@/utils/banglishConverter';

export interface Contact {
  id?: string;
  name: string;
  number: string;
  story?: string;
  tags?: string[];
  date_added?: string;
  synced?: boolean;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const { user } = useAuth();
  const { clearAllErrors } = useSyncNotification();

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your data...",
      });
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your data will sync when connection is restored",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Attempt to sync when requested by service worker
  useEffect(() => {
    const handleAttemptSync = () => {
      if (isOnline && user) {
        syncPendingOperations();
      }
    };
    
    window.addEventListener('attemptSync', handleAttemptSync);
    
    return () => {
      window.removeEventListener('attemptSync', handleAttemptSync);
    };
  }, [isOnline, user]);

  // Load contacts on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    // Always load from localStorage first for instant display
    const storedContacts = loadContactsFromStorage(user.uid);
    setContacts(storedContacts);

    // If online, also setup Firebase listener and sync offline operations
    if (isOnline) {
      setLoading(true);
      
      // Sync any pending offline operations
      syncPendingOperations();
      
      const unsubscribe = setupContactsListener(
        db, 
        user.uid,
        (firebaseContacts) => {
          // Merge Firebase and local contacts, prioritizing Firebase data
          mergeContacts(firebaseContacts, storedContacts);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching from Firebase:', error);
          setLoading(false);
          // Continue with localStorage data on Firebase error
        }
      );

      return () => unsubscribe();
    }
  }, [user, isOnline]);

  // Merge Firebase and local contacts
  const mergeContacts = useCallback((firebaseContacts: Contact[], localContacts: Contact[]) => {
    if (!user) return;
    
    // Create a map to efficiently merge contacts
    const contactMap = new Map<string, Contact>();
    
    // Add Firebase contacts first (they take priority)
    firebaseContacts.forEach(contact => {
      if (contact.id) {
        contactMap.set(contact.id, { ...contact, synced: true });
      }
    });
    
    // Add local contacts that don't conflict with Firebase
    // or that are marked as not synced
    localContacts.forEach(contact => {
      if (contact.id && (!contactMap.has(contact.id) || !contact.synced)) {
        contactMap.set(contact.id, contact);
      }
    });
    
    // Convert map back to array and sort by date
    const mergedContacts = Array.from(contactMap.values()).sort((a, b) => {
      if (!a.date_added || !b.date_added) return 0;
      return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
    });
    
    // Update state and localStorage
    setContacts(mergedContacts);
    saveContactsToStorage(mergedContacts, user.uid);
  }, [user]);

  // Sync offline operations to Firebase
  const syncPendingOperations = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const offlineQueue = getOfflineQueue(user.uid);
      
      if (offlineQueue.length === 0) return;

      // Sync operations to Firebase
      const result = await syncOfflineOperations(db, user.uid, offlineQueue);
      
      // Handle successful syncs
      if (result.success) {
        // Update local contacts with new Firebase IDs if needed
        const updatedContacts = [...contacts];
        
        for (const syncResult of result.syncedOperations) {
          // If this was an add operation and we got a new Firebase ID
          if (syncResult.operation.type === 'add' && syncResult.newId) {
            // Find the local contact with the temp ID
            const localContactIndex = updatedContacts.findIndex(
              c => c.id === syncResult.operation.contactId
            );
            
            if (localContactIndex >= 0) {
              // Update the ID and mark as synced
              updatedContacts[localContactIndex] = {
                ...updatedContacts[localContactIndex],
                id: syncResult.newId,
                synced: true
              };
            }
          }
          
          // For updates, mark the contact as synced
          if (syncResult.operation.type === 'update') {
            const localContactIndex = updatedContacts.findIndex(
              c => c.id === syncResult.operation.contactId
            );
            
            if (localContactIndex >= 0) {
              updatedContacts[localContactIndex] = {
                ...updatedContacts[localContactIndex],
                synced: true
              };
            }
          }
        }
        
        // Save updated contacts
        setContacts(updatedContacts);
        saveContactsToStorage(updatedContacts, user.uid);
        
        // Clear the sync queue
        saveOfflineQueue([], user.uid);
        
        // Clear any existing sync errors
        clearAllErrors();
        
        toast({
          title: "Sync Complete",
          description: `${offlineQueue.length} changes synced successfully!`,
        });
      }
    } catch (error) {
      console.error('Error syncing offline operations:', error);
      
      // Mark operations with increased retry count
      const offlineQueue = getOfflineQueue(user.uid);
      const updatedQueue = offlineQueue.map(op => ({
        ...op,
        retryCount: (op.retryCount || 0) + 1
      }));
      
      saveOfflineQueue(updatedQueue, user.uid);
      
      // Register for background sync
      registerForSync();
      
      toast({
        title: "Sync Error",
        description: "Some changes couldn't be synced. They'll retry when connection improves.",
        variant: "destructive",
      });
    }
  }, [user, isOnline, contacts, toast, clearAllErrors]);

  const addContact = useCallback(async (contactData: Omit<Contact, 'id' | 'date_added'>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        date_added: new Date().toISOString(),
        synced: false
      };
      
      // Always add to localStorage first
      const updatedContacts = [newContact, ...contacts];
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts, user.uid);
      
      if (isOnline) {
        // Try to add to Firebase immediately
        try {
          const result = await addContactToFirebase(db, user.uid, contactData);
          
          // Update with Firebase ID
          const syncedContact = { ...newContact, id: result.id, synced: true };
          const syncedContacts = updatedContacts.map(c => 
            c.id === newContact.id ? syncedContact : c
          );
          setContacts(syncedContacts);
          saveContactsToStorage(syncedContacts, user.uid);
          
          toast({
            title: "Success",
            description: "Contact added and synced!",
          });
        } catch (error) {
          console.error('Error adding to Firebase:', error);
          // Add to offline queue
          const op = addToOfflineQueue({
            type: 'add',
            contactId: newContact.id,
            contactData
          }, user.uid);
          
          if (op) {
            saveSyncError(error, op.id, user.uid);
          }
          
          registerForSync();
          
          toast({
            title: "Partial Success",
            description: "Contact saved locally. Will sync when connection improves.",
            variant: "default",
          });
        }
      } else {
        // Add to offline queue
        addToOfflineQueue({
          type: 'add',
          contactId: newContact.id,
          contactData
        }, user.uid);
        
        toast({
          title: "Success",
          description: "Contact saved offline. Will sync when online.",
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, contacts, isOnline, toast]);

  const updateContact = useCallback(async (contactId: string, contactData: Partial<Contact>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update in localStorage first
      const updatedContacts = contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, ...contactData, synced: false }
          : contact
      );
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts, user.uid);
      
      if (isOnline) {
        try {
          await updateContactInFirebase(db, contactId, contactData);
          
          // Mark as synced
          const syncedContacts = updatedContacts.map(c => 
            c.id === contactId ? { ...c, synced: true } : c
          );
          setContacts(syncedContacts);
          saveContactsToStorage(syncedContacts, user.uid);
          
          toast({
            title: "Success",
            description: "Contact updated and synced!",
          });
        } catch (error) {
          console.error('Error updating in Firebase:', error);
          // Add to offline queue
          const op = addToOfflineQueue({
            type: 'update',
            contactId,
            contactData
          }, user.uid);
          
          if (op) {
            saveSyncError(error, op.id, user.uid);
          }
          
          registerForSync();
          
          toast({
            title: "Partial Success",
            description: "Contact updated locally. Will sync when connection improves.",
            variant: "default",
          });
        }
      } else {
        // Add to offline queue
        addToOfflineQueue({
          type: 'update',
          contactId,
          contactData
        }, user.uid);
        
        toast({
          title: "Success",
          description: "Contact updated offline. Will sync when online.",
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, contacts, isOnline, toast]);

  const deleteContact = useCallback(async (contactId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Remove from localStorage first
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts, user.uid);
      
      if (isOnline) {
        try {
          await deleteContactFromFirebase(db, contactId);
          
          toast({
            title: "Success",
            description: "Contact deleted and synced!",
          });
        } catch (error) {
          console.error('Error deleting from Firebase:', error);
          // Add to offline queue
          const op = addToOfflineQueue({
            type: 'delete',
            contactId
          }, user.uid);
          
          if (op) {
            saveSyncError(error, op.id, user.uid);
          }
          
          registerForSync();
          
          toast({
            title: "Partial Success",
            description: "Contact deleted locally. Will sync when connection improves.",
            variant: "default",
          });
        }
      } else {
        // Add to offline queue
        addToOfflineQueue({
          type: 'delete',
          contactId
        }, user.uid);
        
        toast({
          title: "Success",
          description: "Contact deleted offline. Will sync when online.",
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, contacts, isOnline, toast]);

  // Enhanced search with Banglish support
  const searchContacts = useCallback((searchTerm: string) => {
    if (!searchTerm) return contacts;
    
    return contacts.filter(contact => 
      searchWithBanglishSupport(contact.name, searchTerm) ||
      searchWithBanglishSupport(contact.number, searchTerm) ||
      (contact.story && searchWithBanglishSupport(contact.story, searchTerm)) ||
      contact.tags?.some(tag => searchWithBanglishSupport(tag, searchTerm))
    );
  }, [contacts]);

  // Force sync contacts
  const forceSync = useCallback(() => {
    if (user && isOnline) {
      toast({
        title: "Syncing",
        description: "Attempting to sync your contacts...",
      });
      syncPendingOperations();
    } else if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [user, isOnline, syncPendingOperations, toast]);

  return {
    contacts,
    loading,
    isOnline,
    addContact,
    updateContact,
    deleteContact,
    searchContacts,
    forceSync
  };
};
