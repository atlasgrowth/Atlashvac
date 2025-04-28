import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uuidv4 } from '@shared/utils';
import { useBusinessContext } from '@/hooks/useBusinessContext';

interface ChatWidgetProps {
  businessId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isFromBusiness: boolean;
  timestamp: Date;
}

export function ChatWidget({ businessId, isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [visitorId, setVisitorId] = useState<string>('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    submitted: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useRef<WebSocket | null>(null);
  const { currentBusiness } = useBusinessContext();
  
  // Initialize visitor ID and WebSocket connection
  useEffect(() => {
    if (!isOpen) return;
    
    // Generate or retrieve visitor ID
    const storedVisitorId = localStorage.getItem('visitorId');
    const newVisitorId = storedVisitorId || uuidv4();
    if (!storedVisitorId) {
      localStorage.setItem('visitorId', newVisitorId);
    }
    setVisitorId(newVisitorId);
    
    // Connect to WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?visitorId=${newVisitorId}`;
    
    socket.current = new WebSocket(wsUrl);
    
    socket.current.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_CHAT_MESSAGE' && data.payload.businessId === businessId) {
          const message = data.payload.message;
          if (message.isFromBusiness) {
            setMessages(prev => [
              ...prev,
              {
                id: uuidv4(),
                content: message.content,
                isFromBusiness: true,
                timestamp: new Date()
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // Clean up
    return () => {
      if (socket.current) {
        socket.current.close();
        socket.current = null;
      }
    };
  }, [businessId, isOpen]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Add welcome message when widget is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: uuidv4(),
          content: `Welcome to ${currentBusiness?.name || 'our chat'}! How can we help you today?`,
          isFromBusiness: true,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages.length, currentBusiness]);
  
  // Handle form submission to create conversation if needed
  const ensureConversation = async (): Promise<number> => {
    if (conversationId) return conversationId;
    
    try {
      setIsLoading(true);
      
      // First create or get a contact
      let contactId;
      if (contactInfo.submitted && contactInfo.name && (contactInfo.email || contactInfo.phone)) {
        const names = contactInfo.name.split(' ');
        const firstName = names[0] || '';
        const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
        
        const contactResponse = await fetch(`/api/businesses/${businessId}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email: contactInfo.email,
            phone: contactInfo.phone
          })
        });
        
        if (!contactResponse.ok) {
          throw new Error('Failed to create contact');
        }
        
        const contact = await contactResponse.json();
        contactId = contact.id;
      }
      
      // Create conversation
      const conversationResponse = await fetch(`/api/businesses/${businessId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          visitorId
        })
      });
      
      if (!conversationResponse.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const conversation = await conversationResponse.json();
      setConversationId(conversation.id);
      return conversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const content = input.trim();
    setInput('');
    
    // Add message to UI immediately
    const tempMessage: Message = {
      id: uuidv4(),
      content,
      isFromBusiness: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // Get or create conversation
      const convoId = await ensureConversation();
      
      // Send message to server
      const response = await fetch(`/api/conversations/${convoId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          isFromBusiness: false
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // You could add error handling UI here
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Minimize the widget when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => onClose()} 
          className="rounded-full h-14 w-14 shadow-lg bg-primary-600 hover:bg-primary-700 text-white"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }
  
  // Show contact form if not submitted yet
  if (!contactInfo.submitted && messages.length <= 2) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
        <Card className="shadow-xl border-primary-500 border">
          <CardHeader className="bg-primary-600 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Chat with {currentBusiness?.name || 'Us'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-primary-700">
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4 pt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <Input 
                  id="name"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Input 
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <Input 
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Your phone number"
                  className="mt-1"
                />
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => setContactInfo(prev => ({ ...prev, submitted: true }))}
                disabled={!contactInfo.name || (!contactInfo.email && !contactInfo.phone)}
              >
                Start Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main chat widget UI
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 md:w-96">
      <Card className="shadow-xl border-primary-500 border flex flex-col" style={{ height: '400px' }}>
        <CardHeader className="bg-primary-600 text-white py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-primary-300 text-primary-800">
                  {currentBusiness?.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{currentBusiness?.name || 'Chat'}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-primary-700">
              <X size={18} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.isFromBusiness ? '' : 'justify-end'}`}
            >
              {message.isFromBusiness && (
                <div className="flex-shrink-0 mr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {currentBusiness?.name?.charAt(0) || 'B'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div>
                <div className={`p-3 rounded-lg ${
                  message.isFromBusiness 
                    ? 'bg-white shadow-sm' 
                    : 'bg-primary-100 shadow-sm'
                }`}>
                  <p className="text-sm text-gray-900">{message.content}</p>
                </div>
                <div className={`mt-1 text-xs text-gray-500 ${message.isFromBusiness ? '' : 'text-right'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!message.isFromBusiness && (
                <div className="flex-shrink-0 ml-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {contactInfo.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <div className="flex items-center w-full">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button 
              className="ml-2" 
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
