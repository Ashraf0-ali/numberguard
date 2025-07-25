import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useContacts, Contact } from '@/hooks/useContacts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSyncNotification } from '@/hooks/useSyncNotification';
import ContactCard from './ContactCard';
import ContactForm from './ContactForm';
import ContactDetailPopup from './ContactDetailPopup';
import AIStoryMode from './AIStoryMode';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Search, Plus, Users, Brain, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import StorageInfo from './StorageInfo';

const ContactList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const { contacts, loading, deleteContact, searchContacts, isOnline, forceSync } = useContacts();
  const { language, t } = useLanguage();
  const { hasSyncErrors } = useSyncNotification();

  const filteredContacts = searchContacts(searchTerm);

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(contactId);
    }
  };

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailPopupOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleCloseDetailPopup = () => {
    setIsDetailPopupOpen(false);
    setSelectedContact(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold text-gray-800 dark:text-gray-200 ${language === 'bn' ? 'font-bangla' : 'font-poppins'}`}>
              {t('myContacts')}
            </h2>
            <p className={`text-gray-600 dark:text-gray-400 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
              {contacts.length} {t('contactsSaved')}
            </p>
          </div>
        </div>
        
        {/* Sync Status and Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={forceSync}
            disabled={!isOnline}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t('sync')}
          </Button>
          
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
      </div>
      
      {/* Storage Info */}
      <StorageInfo />
      
      {/* Sync Error Alert */}
      {hasSyncErrors && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertTitle className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            Sync Error
          </AlertTitle>
          <AlertDescription className={language === 'bn' ? 'font-bangla' : 'font-inter'}>
            Some changes couldn't be synced. They'll retry when connection improves.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs for different modes */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80">
          <TabsTrigger value="contacts" className={`flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
            <Users className="h-4 w-4" />
            {t('contacts')}
          </TabsTrigger>
          <TabsTrigger value="ai-story" className={`flex items-center gap-2 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
            <Brain className="h-4 w-4" />
            {t('aiStoryMode')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="space-y-6">
          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm focus:ring-2 focus:ring-blue-500 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
              />
            </div>
            
            <Button
              onClick={() => setIsFormOpen(true)}
              className={`bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addContact')}
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className={`text-gray-600 dark:text-gray-400 mt-2 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
                {t('loading')}
              </p>
            </div>
          )}

          {/* Contacts Grid */}
          {!loading && (
            <>
              {filteredContacts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEditContact}
                      onDelete={handleDeleteContact}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {searchTerm ? 'No contacts found' : 'No contacts yet'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Add your first contact to get started'
                    }
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setIsFormOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Contact
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="ai-story">
          <AIStoryMode />
        </TabsContent>
      </Tabs>

      {/* Contact Form */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        contact={editingContact}
      />

      {/* Contact Detail Popup */}
      <ContactDetailPopup
        contact={selectedContact}
        isOpen={isDetailPopupOpen}
        onClose={handleCloseDetailPopup}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
      />
    </div>
  );
};

export default ContactList;
