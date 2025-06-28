
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
    // Basic phone number formatting
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return number;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{contact.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-2 text-gray-600">
              <Phone className="h-4 w-4" />
              <span className="font-mono">{formatPhoneNumber(contact.number)}</span>
            </div>
            
            {contact.date_added && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Calendar className="h-4 w-4" />
                <span>Added {formatDate(contact.date_added)}</span>
              </div>
            )}
            
            {contact.story && (
              <p className="text-gray-600 text-sm mb-3 italic">"{contact.story}"</p>
            )}
            
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {contact.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(contact)}
              className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => contact.id && onDelete(contact.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactCard;
