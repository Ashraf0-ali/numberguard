
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contact } from '@/hooks/useContacts';
import { Phone, User, Calendar, Edit, Trash2 } from 'lucide-react';

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

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0">
                <User className="h-3 w-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{contact.name}</h3>
            </div>
            
            <div className="flex items-center gap-1.5 mb-2 text-gray-600 dark:text-gray-400">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="font-mono text-xs truncate">{formatPhoneNumber(contact.number)}</span>
            </div>
            
            {contact.date_added && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{formatDate(contact.date_added)}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(contact)}
              className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => contact.id && onDelete(contact.id)}
              className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {contact.story && (
          <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 italic line-clamp-2">"{contact.story}"</p>
        )}
        
        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              >
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{contact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactCard;
