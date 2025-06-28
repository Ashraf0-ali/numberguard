
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id?: string;
  user_id: string;
  name: string;
  number: string;
  story?: string;
  tags?: string[];
  date_added?: any;
}

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching contacts for user:', user.uid);
      
      const q = query(
        collection(db, 'contacts'),
        where('user_id', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      // Sort contacts by date_added in descending order after fetching
      const sortedContacts = contactsData.sort((a, b) => {
        if (!a.date_added || !b.date_added) return 0;
        const dateA = a.date_added.toDate ? a.date_added.toDate() : new Date(a.date_added);
        const dateB = b.date_added.toDate ? b.date_added.toDate() : new Date(b.date_added);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Fetched contacts:', sortedContacts);
      setContacts(sortedContacts);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<Contact, 'id' | 'user_id' | 'date_added'>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to add contacts",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Adding contact for user:', user.uid, contactData);
      
      const newContact = {
        ...contactData,
        user_id: user.uid,
        date_added: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'contacts'), newContact);
      console.log('Contact added with ID:', docRef.id);
      
      toast({
        title: "Success",
        description: "Contact added successfully!",
      });
      
      await fetchContacts();
    } catch (error: any) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (contactId: string, contactData: Partial<Contact>) => {
    try {
      setLoading(true);
      console.log('Updating contact:', contactId, contactData);
      
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, contactData);
      
      toast({
        title: "Success",
        description: "Contact updated successfully!",
      });
      
      await fetchContacts();
    } catch (error: any) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      setLoading(true);
      console.log('Deleting contact:', contactId);
      
      await deleteDoc(doc(db, 'contacts', contactId));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully!",
      });
      
      await fetchContacts();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    } else {
      setContacts([]);
    }
  }, [user]);

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
    refetch: fetchContacts
  };
};
