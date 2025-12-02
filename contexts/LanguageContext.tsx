import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, getTranslations, getLanguageFromStorage, setLanguageInStorage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [t, setT] = useState<Translations>(getTranslations('en'));

  useEffect(() => {
    const storedLanguage = getLanguageFromStorage();
    setLanguageState(storedLanguage);
    setT(getTranslations(storedLanguage));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setT(getTranslations(lang));
    setLanguageInStorage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
