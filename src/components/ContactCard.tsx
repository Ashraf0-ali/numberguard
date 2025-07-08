
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/hooks/useContacts';
import { Phone, User, Calendar, Edit, Trash2, PhoneCall } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatPhoneNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  const handleCall = () => {
    window.location.href = `tel:${contact.number}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01] border border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0">
                <User className="h-2.5 w-2.5 text-white" />
              </div>
              <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{contact.name}</h3>
            </div>
            
            <div className="flex items-center gap-1 mb-1 text-gray-600 dark:text-gray-400">
              <Phone className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{formatPhoneNumber(contact.number)}</span>
            </div>
            
            {contact.date_added && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                <span>{formatDate(contact.date_added)}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCall}
              className="h-5 w-5 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 hover:text-green-600 border-gray-300 dark:border-gray-600"
            >
              <PhoneCall className="h-2.5 w-2.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(contact)}
              className="h-5 w-5 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 border-gray-300 dark:border-gray-600"
            >
              <Edit className="h-2.5 w-2.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => contact.id && onDelete(contact.id)}
              className="h-5 w-5 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 border-gray-300 dark:border-gray-600"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>
        
        {contact.story && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-1 italic line-clamp-1">"{contact.story}"</p>
        )}
        
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-0.5">
            {contact.tags.slice(0, 2).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-1.5 py-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{contact.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactCard;
