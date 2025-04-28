import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Search, User, Phone, Mail, Plus } from 'lucide-react';

export function MessagesPage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // Fetch conversations
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: [`/api/businesses/${businessId}/conversations`],
    enabled: !!businessId,
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Conversation list */}
            <div className="col-span-1 border-r">
              {/* Search bar */}
              <div className="p-4 border-b">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search messages" 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm" 
                  />
                </div>
              </div>
              
              {/* Conversation list */}
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {isLoadingConversations ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by sending a new message.
                    </p>
                    <div className="mt-6">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  conversations.map((conversation: any) => (
                    <div key={conversation.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.contactName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Message content */}
            <div className="col-span-2 flex flex-col h-[600px]">
              {/* Empty state */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a conversation from the list to view messages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}