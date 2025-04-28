import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { useBusinessWebSocket } from '@/hooks/useWebSocket';
import { WebSocketMessageType } from '@shared/types';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Phone, 
  MoreVertical,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageThreadProps {
  conversationId: number | null;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();
  const { sendChatMessage } = useBusinessWebSocket(businessId);
  
  // Get conversation details
  const { data: conversations = [] } = useQuery({
    queryKey: [`/api/businesses/${businessId}/conversations`],
    enabled: !!businessId,
  });
  
  const conversation = conversations.find((c: any) => c.id === conversationId);
  
  // Get contact details
  const { data: contacts = [] } = useQuery({
    queryKey: [`/api/businesses/${businessId}/contacts`],
    enabled: !!businessId,
  });
  
  const contact = contacts.find((c: any) => c.id === conversation?.contactId);
  
  // Get messages
  const {
    data: messages = [],
    isLoading: isLoadingMessages
  } = useQuery({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });
  
  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!conversationId) return;
      
      const response = await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate conversations to update unread count
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/conversations`] });
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!conversationId) return;
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          isFromBusiness: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear input after sending
      setNewMessage('');
      
      // Invalidate messages and conversations to update
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/conversations`] });
    }
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && conversation?.unreadCount > 0) {
      markAsReadMutation.mutate();
    }
  }, [conversationId, conversation]);
  
  // Send message handler
  const handleSendMessage = () => {
    if (!newMessage.trim() || !conversationId) return;
    
    // Use WebSocket to send message
    const sent = sendChatMessage(conversationId, newMessage.trim());
    
    if (!sent) {
      // Fall back to REST API if WebSocket fails
      sendMessageMutation.mutate(newMessage.trim());
    } else {
      // Clear input after sending
      setNewMessage('');
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Show empty state if no conversation is selected
  if (!conversationId) {
    return (
      <Card className="flex-1 flex flex-col w-full h-full border-0 rounded-none shadow-none bg-gray-50">
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a conversation to view messages
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="flex-1 flex flex-col w-full h-full border-0 rounded-none shadow-none">
      <CardHeader className="border-b border-gray-200 px-6 py-4 flex flex-row items-center">
        {isLoadingMessages ? (
          <div className="flex items-center w-full">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="ml-3 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {contact ? contact.firstName.charAt(0) : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'}
              </div>
              <div className="text-xs text-gray-500">
                {contact?.email || contact?.phone || 'No contact info'}
              </div>
            </div>
            <div className="ml-auto flex items-center">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="ml-2 text-gray-400 hover:text-gray-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-6 overflow-y-auto bg-gray-50">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                {i % 2 === 0 && <Skeleton className="h-10 w-10 rounded-full mr-3" />}
                <div>
                  <Skeleton className={`h-20 w-64 rounded-lg ${i % 2 === 0 ? 'bg-white' : 'bg-primary-100'}`} />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
                {i % 2 !== 0 && <Skeleton className="h-10 w-10 rounded-full ml-3" />}
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <div key={message.id} className={`flex ${message.isFromBusiness ? 'justify-end' : ''}`}>
                {!message.isFromBusiness && (
                  <div className="flex-shrink-0 mr-3">
                    <Avatar>
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {contact ? contact.firstName.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div>
                  <div className={`p-3 rounded-lg ${
                    message.isFromBusiness 
                      ? 'bg-primary-100 shadow-sm' 
                      : 'bg-white shadow-sm'
                  }`}>
                    <p className="text-sm text-gray-900">{message.content}</p>
                  </div>
                  <div className={`mt-1 text-xs text-gray-500 ${message.isFromBusiness ? 'text-right' : ''}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.isFromBusiness && (
                  <div className="flex-shrink-0 ml-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary-100 text-primary-600">
                        {currentBusiness?.name?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 bg-white">
        <div className="flex items-center w-full">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow resize-none min-h-[60px]"
            rows={1}
          />
          <Button 
            className="ml-3" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
