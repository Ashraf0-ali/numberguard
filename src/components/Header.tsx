
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, LogOut, User, Moon, Sun, Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${language === 'bn' ? 'font-bangla' : 'font-poppins'}`}>
                {t('appTitle')}
              </h1>
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
                {t('appSubtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('bn')} className="font-bangla">
                  বাংলা
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="font-inter">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} className="font-inter">
                  हिन्दी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <div className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className={`hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 ${language === 'bn' ? 'font-bangla' : 'font-inter'}`}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
