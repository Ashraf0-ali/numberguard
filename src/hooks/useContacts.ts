
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
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
      const q = query(
        collection(db, 'contacts'),
        where('user_id', '==', user.uid),
        orderBy('date_added', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const contactsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      
      setContacts(contactsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
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
      const newContact = {
        ...contactData,
        user_id: user.uid,
        date_added: serverTimestamp()
      };
      
      await addDoc(collection(db, 'contacts'), newContact);
      toast({
        title: "Success",
        description: "Contact added successfully!",
      });
      
      fetchContacts();
    } catch (error: any) {
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
    try {
      setLoading(true);
      const contactRef = doc(db, 'contacts', contactId);
      await updateDoc(contactRef, contactData);
      
      toast({
        title: "Success",
        description: "Contact updated successfully!",
      });
      
      fetchContacts();
    } catch (error: any) {
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
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'contacts', contactId));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully!",
      });
      
      fetchContacts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
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
