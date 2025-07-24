
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Contact, useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';

interface BackupManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ isOpen, onClose }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { contacts, addContact } = useContacts();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        contactCount: contacts.length,
        contacts: contacts.map(contact => ({
          name: contact.name,
          number: contact.number,
          story: contact.story || '',
          tags: contact.tags || [],
          date_added: contact.date_added
        }))
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `numberguard-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
      
      toast({
        title: "ব্যাকাপ সফল!",
        description: `${contacts.length}টি কন্টাক্ট এক্সপোর্ট হয়েছে`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "এক্সপোর্ট ব্যর্থ",
        description: "ব্যাকাপ তৈরিতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import data
      if (!importData.contacts || !Array.isArray(importData.contacts)) {
        throw new Error('Invalid backup file format');
      }

      let importedCount = 0;
      let duplicateCount = 0;

      for (const contact of importData.contacts) {
        // Check if contact already exists
        const existingContact = contacts.find(c => 
          c.number === contact.number || c.name === contact.name
        );
        
        if (existingContact) {
          duplicateCount++;
          continue;
        }

        // Add new contact
        await addContact({
          name: contact.name || '',
          number: contact.number || '',
          story: contact.story || '',
          tags: contact.tags || []
        });
        
        importedCount++;
      }

      toast({
        title: "ইম্পোর্ট সফল!",
        description: `${importedCount}টি নতুন কন্টাক্ট যোগ হয়েছে। ${duplicateCount}টি ডুপ্লিকেট এড়িয়ে যাওয়া হয়েছে।`,
      });
      
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "ইম্পোর্ট ব্যর্থ",
        description: "ফাইল পড়তে সমস্যা হয়েছে। সঠিক ব্যাকাপ ফাইল নির্বাচন করুন।",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ব্যাকাপ ম্যানেজার
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">ব্যাকাপ তৈরি করুন</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              আপনার সব কন্টাক্ট JSON ফাইলে সেভ করুন
            </p>
            <Button 
              onClick={handleExport}
              className="w-full"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {contacts.length}টি কন্টাক্ট এক্সপোর্ট করুন
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Import Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">ব্যাকাপ থেকে পুনরুদ্ধার</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                আগের ব্যাকাপ ফাইল থেকে কন্টাক্ট ইম্পোর্ট করুন
              </p>
              
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ডুপ্লিকেট কন্টাক্ট এড়িয়ে যাওয়া হবে
                </p>
              </div>

              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {isImporting && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      ইম্পোর্ট হচ্ছে...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackupManager;
