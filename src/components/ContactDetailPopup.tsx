
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/hooks/useContacts';
import { 
  Phone, 
  User, 
  Calendar, 
  Edit, 
  Trash2, 
  PhoneCall,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { useState } from 'react';

interface ContactDetailPopupProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

const ContactDetailPopup: React.FC<ContactDetailPopupProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!contact) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    return number;
  };

  const handleCall = () => {
    const phoneNumber = contact.number.replace(/\s+/g, '');
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleSMS = () => {
    const phoneNumber = contact.number.replace(/\s+/g, '');
    window.location.href = `sms:${phoneNumber}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`আপনি কি নিশ্চিত যে ${contact.name} কে ডিলিট করতে চান?`)) {
      if (contact.id) {
        onDelete(contact.id);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            কন্টাক্ট বিস্তারিত
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Name Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {contact.name}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(contact.name, 'name')}
                className="h-6 w-6 p-0"
              >
                {copiedField === 'name' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Phone Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">ফোন নাম্বার</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <span className="font-mono text-lg">{formatPhoneNumber(contact.number)}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(contact.number, 'number')}
                className="h-6 w-6 p-0"
              >
                {copiedField === 'number' ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCall}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                কল করুন
              </Button>
              <Button
                onClick={handleSMS}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>

          {/* Story Section */}
          {contact.story && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">নোট</span>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{contact.story}"
                </p>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">ট্যাগসমূহ</span>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Date Added */}
          {contact.date_added && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>যোগ করা হয়েছে: {formatDate(contact.date_added)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(contact)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              এডিট
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ডিলিট
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            বন্ধ করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailPopup;
