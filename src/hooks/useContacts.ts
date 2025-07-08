import { useState, useEffect } from 'react';
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
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Contact {
  id?: string;
  name: string;
  number: string;
  story?: string;
  tags?: string[];
  date_added?: string;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Real-time listener for contacts
  useEffect(() => {
    if (!user) {
      setContacts([]);
      return;
    }

    setLoading(true);
    
    const contactsQuery = query(
      collection(db, 'contacts'),
      where('userId', '==', user.uid),
      orderBy('date_added', 'desc')
    );

    const unsubscribe = onSnapshot(contactsQuery, (snapshot) => {
      const contactsData: Contact[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        contactsData.push({
          id: doc.id,
          name: data.name,
          number: data.number,
          story: data.story,
          tags: data.tags,
          date_added: data.date_added?.toDate?.()?.toISOString() || data.date_added
        });
      });
      setContacts(contactsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching contacts:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const addContact = async (contactData: Omit<Contact, 'id' | 'date_added'>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'contacts'), {
        ...contactData,
        userId: user.uid,
        date_added: serverTimestamp()
      });
      
      toast({
        title: "Success",
        description: "Contact added successfully!",
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
  };

  const updateContact = async (contactId: string, contactData: Partial<Contact>) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, contactData);
      
      toast({
        title: "Success",
        description: "Contact updated successfully!",
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
  };

  const deleteContact = async (contactId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const contactRef = doc(db, 'contacts', contactId);
      await deleteDoc(contactRef);
      
      toast({
        title: "Success",
        description: "Contact deleted successfully!",
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
  };

  const searchContacts = (searchTerm: string) => {
    if (!searchTerm) return contacts;
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.number.includes(searchTerm) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    searchContacts,
    refetch: () => {} // Not needed with real-time listener
  };
};