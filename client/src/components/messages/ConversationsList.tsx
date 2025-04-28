import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Search, 
  FilterIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@shared/utils';

interface ConversationsListProps {
  selectedConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
}

export function ConversationsList({ 
  selectedConversationId, 
  onSelectConversation 
}: ConversationsListProps) {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: [`/api/businesses/${businessId}/conversations`],
    enabled: !!businessId,
  });
  
  // Get contacts to display names
  const { data: contacts = [] } = useQuery({
    queryKey: [`/api/businesses/${businessId}/contacts`],
    enabled: !!businessId,
  });
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation: any) => {
    if (!searchTerm) return true;
    
    const contact = contacts.find((c: any) => c.id === conversation.contactId);
    const contactName = contact ? `${contact.firstName} ${contact.lastName}` : '';
    
    return (
      contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const getContactName = (contactId: number) => {
    const contact = contacts.find((c: any) => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
  };
  
  return (
    <Card className="flex-1 flex flex-col w-full h-full border-0 rounded-none shadow-none">
      <CardHeader className="border-b border-gray-200 px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-gray-900">Messages</CardTitle>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500">
            <FilterIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500 ml-2">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <div className="px-6 py-2 border-b border-gray-200">
        <Input
          type="search"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map((conversation: any) => (
              <li key={conversation.id}>
                <button 
                  className={`relative w-full px-6 py-5 flex items-center space-x-3 text-left hover:bg-gray-50 ${
                    selectedConversationId === conversation.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex-shrink-0">
                    <Avatar>
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {getContactName(conversation.contactId).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getContactName(conversation.contactId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {timeAgo(new Date(conversation.lastMessageAt))}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500">
                        <span className="text-xs font-medium text-white">{conversation.unreadCount}</span>
                      </span>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
