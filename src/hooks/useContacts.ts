import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Contact {
  id?: string;
  name: string;
  number: string;
  story?: string;
  tags?: string[];
  date_added?: string;
}

const STORAGE_KEY = 'numberguard_contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get user-specific storage key
  const getUserStorageKey = () => {
    return user ? `${STORAGE_KEY}_${user.uid}` : STORAGE_KEY;
  };

  // Load contacts from localStorage
  const loadContacts = () => {
    try {
      const stored = localStorage.getItem(getUserStorageKey());
      if (stored) {
        const parsedContacts = JSON.parse(stored);
        // Sort contacts by date_added in descending order
        const sortedContacts = parsedContacts.sort((a: Contact, b: Contact) => {
          if (!a.date_added || !b.date_added) return 0;
          return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
        });
        setContacts(sortedContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  // Save contacts to localStorage
  const saveContacts = (contactsToSave: Contact[]) => {
    try {
      localStorage.setItem(getUserStorageKey(), JSON.stringify(contactsToSave));
    } catch (error) {
      console.error('Error saving contacts:', error);
      toast({
        title: "Error",
        description: "Failed to save contacts",
        variant: "destructive",
      });
    }
  };

  const fetchContacts = () => {
    setLoading(true);
    loadContacts();
    setLoading(false);
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'date_added'>) => {
    try {
      setLoading(true);
      
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        date_added: new Date().toISOString()
      };
      
      const updatedContacts = [newContact, ...contacts];
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
      
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

  const updateContact = (contactId: string, contactData: Partial<Contact>) => {
    try {
      setLoading(true);
      
      const updatedContacts = contacts.map(contact => 
        contact.id === contactId 
          ? { ...contact, ...contactData }
          : contact
      );
      
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
      
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

  const deleteContact = (contactId: string) => {
    try {
      setLoading(true);
      
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
      
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

  useEffect(() => {
    if (user) {
      loadContacts();
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