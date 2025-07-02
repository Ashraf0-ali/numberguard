import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    appTitle: 'NumberGuard AI',
    appSubtitle: 'Secure Contact Management',
    myContacts: 'My Contacts',
    contactsSaved: 'contacts saved',
    addContact: 'Add Contact',
    searchPlaceholder: 'Search contacts by name, number, or tags...',
    aiStoryMode: 'AI Story Mode',
    contacts: 'Contacts',
    logout: 'Logout',
    loading: 'Loading...',
  },
  bn: {
    appTitle: 'নাম্বারগার্ড এআই',
    appSubtitle: 'নিরাপদ যোগাযোগ ব্যবস্থাপনা',
    myContacts: 'আমার যোগাযোগ',
    contactsSaved: 'যোগাযোগ সংরক্ষিত',
    addContact: 'যোগাযোগ যোগ করুন',
    searchPlaceholder: 'নাম, নম্বর বা ট্যাগ দিয়ে যোগাযোগ খুঁজুন...',
    aiStoryMode: 'এআই গল্প মোড',
    contacts: 'যোগাযোগ',
    logout: 'লগআউট',
    loading: 'লোড হচ্ছে...',
  },
  hi: {
    appTitle: 'नंबरगार्ड एआई',
    appSubtitle: 'सुरक्षित संपर्क प्रबंधन',
    myContacts: 'मेरे संपर्क',
    contactsSaved: 'संपर्क सहेजे गए',
    addContact: 'संपर्क जोड़ें',
    searchPlaceholder: 'नाम, नंबर या टैग से संपर्क खोजें...',
    aiStoryMode: 'एआई स्टोरी मोड',
    contacts: 'संपर्क',
    logout: 'लॉगआउट',
    loading: 'लोड हो रहा है...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};