
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
  Firestore
} from 'firebase/firestore';
import { Contact } from '@/hooks/useContacts';
import { OfflineOperation } from './storageUtils';

// Add a contact to Firebase
export const addContactToFirebase = async (
  db: Firestore, 
  userId: string, 
  contactData: Omit<Contact, 'id' | 'date_added'>
) => {
  try {
    const docRef = await addDoc(collection(db, 'contacts'), {
      ...contactData,
      userId,
      date_added: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding contact to Firebase:', error);
    throw error;
  }
};

// Update a contact in Firebase
export const updateContactInFirebase = async (
  db: Firestore,
  contactId: string,
  contactData: Partial<Contact>
) => {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    await updateDoc(contactRef, contactData);
    return { success: true };
  } catch (error) {
    console.error('Error updating contact in Firebase:', error);
    throw error;
  }
};

// Delete a contact from Firebase
export const deleteContactFromFirebase = async (
  db: Firestore,
  contactId: string
) => {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    await deleteDoc(contactRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact from Firebase:', error);
    throw error;
  }
};

// Sync offline operations to Firebase
export const syncOfflineOperations = async (
  db: Firestore,
  userId: string,
  operations: OfflineOperation[]
) => {
  if (!operations.length) return { success: true, syncedOperations: [] };

  try {
    const batch = writeBatch(db);
    const results = [];
    
    for (const operation of operations) {
      if (operation.type === 'add' && operation.contactData) {
        const contactRef = doc(collection(db, 'contacts'));
        batch.set(contactRef, {
          ...operation.contactData,
          userId,
          date_added: serverTimestamp()
        });
        results.push({
          operation,
          success: true,
          newId: contactRef.id
        });
      } else if (operation.type === 'update' && operation.contactId) {
        const contactRef = doc(db, 'contacts', operation.contactId);
        batch.update(contactRef, operation.contactData);
        results.push({
          operation,
          success: true
        });
      } else if (operation.type === 'delete' && operation.contactId) {
        const contactRef = doc(db, 'contacts', operation.contactId);
        batch.delete(contactRef);
        results.push({
          operation,
          success: true
        });
      }
    }

    await batch.commit();
    
    return {
      success: true,
      syncedOperations: results
    };
  } catch (error) {
    console.error('Error syncing offline operations:', error);
    throw error;
  }
};

// Set up listener for contacts from Firebase
export const setupContactsListener = (
  db: Firestore,
  userId: string,
  onUpdate: (contacts: Contact[]) => void,
  onError: (error: any) => void
) => {
  try {
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', userId)
    );

    return onSnapshot(contactsQuery, (snapshot) => {
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
      
      onUpdate(firebaseContacts);
    }, onError);
  } catch (error) {
    console.error('Error setting up contacts listener:', error);
    onError(error);
    return () => {}; // Return empty function as fallback
  }
};

// Check if a contact exists in Firebase (for conflict resolution)
export const checkContactExists = async (
  db: Firestore,
  contactId: string
) => {
  try {
    const contactRef = doc(db, 'contacts', contactId);
    const contactSnap = await getDocs(query(collection(db, 'contacts'), where('__name__', '==', contactId)));
    return !contactSnap.empty;
  } catch (error) {
    console.error('Error checking if contact exists:', error);
    return false;
  }
};
