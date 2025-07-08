import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Contact {
  id?: string;
  name: string;
  number: string;
  story?: string;
  tags?: string[];
  date_added?: string;
  synced?: boolean; // Track if synced to Firebase
}

interface OfflineOperation {
  id: string;
  type: 'add' | 'update' | 'delete';
  contactId?: string;
  contactData?: any;
  timestamp: string;
}

const STORAGE_KEY = 'numberguard_contacts';
const OFFLINE_QUEUE_KEY = 'numberguard_offline_queue';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get user-specific storage keys
  const getUserStorageKey = () => {
    return user ? `${STORAGE_KEY}_${user.uid}` : STORAGE_KEY;
  };

  const getOfflineQueueKey = () => {
    return user ? `${OFFLINE_QUEUE_KEY}_${user.uid}` : OFFLINE_QUEUE_KEY;
  };

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your data...",
      });
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

  // Load contacts from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(getUserStorageKey());
      if (stored) {
        const parsedContacts = JSON.parse(stored);
        const sortedContacts = parsedContacts.sort((a: Contact, b: Contact) => {
          if (!a.date_added || !b.date_added) return 0;
          return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
        });
        setContacts(sortedContacts);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, [user]);

  // Save to localStorage
  const saveToLocalStorage = useCallback((contactsToSave: Contact[]) => {
    try {
      localStorage.setItem(getUserStorageKey(), JSON.stringify(contactsToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [user]);

  // Add operation to offline queue
  const addToOfflineQueue = useCallback((operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    try {
      const existingQueue = JSON.parse(localStorage.getItem(getOfflineQueueKey()) || '[]');
      const newOperation: OfflineOperation = {
        ...operation,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
      };
      existingQueue.push(newOperation);
      localStorage.setItem(getOfflineQueueKey(), JSON.stringify(existingQueue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }, [user]);

  // Sync offline operations to Firebase
  const syncOfflineOperations = useCallback(async () => {
    if (!user || !isOnline) return;

    try {
      const offlineQueue: OfflineOperation[] = JSON.parse(localStorage.getItem(getOfflineQueueKey()) || '[]');
      
      if (offlineQueue.length === 0) return;

      const batch = writeBatch(db);
      
      for (const operation of offlineQueue) {
        if (operation.type === 'add') {
          const contactRef = doc(collection(db, 'contacts'));
          batch.set(contactRef, {
            ...operation.contactData,
            userId: user.uid,
            date_added: serverTimestamp()
          });
        } else if (operation.type === 'update' && operation.contactId) {
          const contactRef = doc(db, 'contacts', operation.contactId);
          batch.update(contactRef, operation.contactData);
        } else if (operation.type === 'delete' && operation.contactId) {
          const contactRef = doc(db, 'contacts', operation.contactId);
          batch.delete(contactRef);
        }
      }

      await batch.commit();
      
      // Clear offline queue after successful sync
      localStorage.removeItem(getOfflineQueueKey());
      
      toast({
        title: "Sync Complete",
        description: `${offlineQueue.length} operations synced successfully!`,
      });
    } catch (error) {
      console.error('Error syncing offline operations:', error);
      toast({
        title: "Sync Error",
        description: "Some changes couldn't be synced. They'll retry when connection improves.",
        variant: "destructive",
      });
    }
  }, [user, isOnline, toast]);

  // Load contacts on component mount and when user changes
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    // Always load from localStorage first for instant display
    loadFromLocalStorage();

    // If online, also setup Firebase listener and sync offline operations
    if (isOnline) {
      setLoading(true);
      
      // Sync any pending offline operations
      syncOfflineOperations();
      
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid),
        orderBy('date_added', 'desc')
      );

      const unsubscribe = onSnapshot(contactsQuery, (snapshot) => {
        const firebaseContacts: Contact[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firebaseContacts.push({
            id: doc.id,
            name: data.name,
            number: data.number,
            story: data.story,
            tags: data.tags,
            date_added: data.date_added?.toDate?.()?.toISOString() || data.date_added,
            synced: true
          });
        });
        
        // Get current local contacts
        const stored = localStorage.getItem(getUserStorageKey());
        const localContacts: Contact[] = stored ? JSON.parse(stored) : [];
        
        // Merge Firebase and local contacts, prioritizing Firebase data
        const contactMap = new Map();
        
        // Add Firebase contacts first
        firebaseContacts.forEach(contact => {
          contactMap.set(contact.id, contact);
        });
        
        // Add local contacts that don't conflict with Firebase
        localContacts.forEach(contact => {
          if (!contactMap.has(contact.id)) {
            contactMap.set(contact.id, contact);
          }
        });
        
        const mergedContacts = Array.from(contactMap.values()).sort((a, b) => {
          if (!a.date_added || !b.date_added) return 0;
          return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
        });
        
        setContacts(mergedContacts);
        saveToLocalStorage(mergedContacts);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching from Firebase:', error);
        setLoading(false);
        // Continue with localStorage data on Firebase error
      });

      return () => unsubscribe();
    }
  }, [user, isOnline]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncOfflineOperations();
    }
  }, [isOnline, user, syncOfflineOperations]);

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
      saveToLocalStorage(updatedContacts);
      
      if (isOnline) {
        // Try to add to Firebase immediately
        try {
          await addDoc(collection(db, 'contacts'), {
            ...contactData,
            userId: user.uid,
            date_added: serverTimestamp()
          });
          
          // Mark as synced in localStorage
          const syncedContact = { ...newContact, synced: true };
          const syncedContacts = updatedContacts.map(c => 
            c.id === newContact.id ? syncedContact : c
          );
          setContacts(syncedContacts);
          saveToLocalStorage(syncedContacts);
        } catch (error) {
          // Add to offline queue if Firebase fails
          addToOfflineQueue({
            type: 'add',
            contactData
          });
        }
      } else {
        // Add to offline queue
        addToOfflineQueue({
          type: 'add',
          contactData
        });
      }
      
      toast({
        title: "Success",
        description: isOnline ? "Contact added and synced!" : "Contact saved offline. Will sync when online.",
      });
    } catch (error: any) {
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
      saveToLocalStorage(updatedContacts);
      
      if (isOnline) {
        try {
          const contactRef = doc(db, 'contacts', contactId);
          await updateDoc(contactRef, contactData);
          
          // Mark as synced
          const syncedContacts = updatedContacts.map(c => 
            c.id === contactId ? { ...c, synced: true } : c
          );
          setContacts(syncedContacts);
          saveToLocalStorage(syncedContacts);
        } catch (error) {
          addToOfflineQueue({
            type: 'update',
            contactId,
            contactData
          });
        }
      } else {
        addToOfflineQueue({
          type: 'update',
          contactId,
          contactData
        });
      }
      
      toast({
        title: "Success",
        description: isOnline ? "Contact updated and synced!" : "Contact updated offline. Will sync when online.",
      });
    } catch (error: any) {
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
      saveToLocalStorage(updatedContacts);
      
      if (isOnline) {
        try {
          const contactRef = doc(db, 'contacts', contactId);
          await deleteDoc(contactRef);
        } catch (error) {
          addToOfflineQueue({
            type: 'delete',
            contactId
          });
        }
      } else {
        addToOfflineQueue({
          type: 'delete',
          contactId
        });
      }
      
      toast({
        title: "Success",
        description: isOnline ? "Contact deleted and synced!" : "Contact deleted offline. Will sync when online.",
      });
    } catch (error: any) {
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

  const searchContacts = useCallback((searchTerm: string) => {
    if (!searchTerm) return contacts;
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.number.includes(searchTerm) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contacts]);

  return {
    contacts,
    loading,
    isOnline,
    addContact,
    updateContact,
    deleteContact,
    searchContacts,
    refetch: loadFromLocalStorage
  };
};