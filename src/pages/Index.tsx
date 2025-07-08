
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import ContactList from '@/components/ContactList';

const Index = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white/80 to-indigo-50/60 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ContactList />
      </main>
    </div>
  );
};

export default Index;
