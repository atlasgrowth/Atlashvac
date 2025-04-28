import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { Business } from '@shared/schema';
import {
  MessageSquare,
  Users,
  Star,
  Calendar,
  Zap,
  Globe,
  BarChart,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Building,
  PlusCircle
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Define the navigation items
const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: BarChart },
  { name: 'Messages', href: '/app/messages', icon: MessageSquare },
  { name: 'Contacts', href: '/app/contacts', icon: Users },
  { name: 'Reviews', href: '/app/reviews', icon: Star },
  { name: 'Schedule', href: '/app/schedule', icon: Calendar },
  { name: 'Automations', href: '/app/automations', icon: Zap },
  { name: 'Website', href: '/app/website', icon: Globe },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
  currentPage?: string;
}

export function AppShell({ children, currentPage = 'dashboard' }: AppShellProps) {
  const { currentBusiness, setCurrentBusiness } = useBusinessContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Fetch all businesses
  const { data: businesses = [] as Business[], isLoading: isLoadingBusinesses } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });
  
  // Handle business selection
  const handleBusinessSelect = (business: Business) => {
    setCurrentBusiness(business);
  };
  
  // Handle logout
  const handleLogout = () => {
    // In a real app, this would clear auth state, tokens, etc.
    navigate('/');
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col flex-1 min-h-0 border-r border-gray-200">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <div className="font-bold text-xl text-primary-600">
              <Link href="/app">HomeServe</Link>
            </div>
            <button
              type="button"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Business selector */}
          <div className="px-4 py-4 border-b border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-between"
                >
                  <div className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="truncate">
                      {currentBusiness?.name || 'Select Business'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Your Businesses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoadingBusinesses ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="px-2 py-1.5">
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))
                ) : businesses.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-gray-500 text-center">
                    No businesses found
                  </div>
                ) : (
                  businesses.map((business: any) => (
                    <DropdownMenuItem 
                      key={business.id}
                      onClick={() => handleBusinessSelect(business)}
                      className={cn(
                        "cursor-pointer",
                        currentBusiness?.id === business.id && "bg-gray-100"
                      )}
                    >
                      <span className="truncate">{business.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Business
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPage === item.href.split('/').pop();
              
              return (
                <div key={item.name}>
                  <Link href={item.href} 
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md group',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}>
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
          
          {/* User menu */}
          <div className="flex items-center p-4 border-t border-gray-200">
            <div className="flex-shrink-0">
              <Avatar>
                <AvatarFallback className="bg-primary-100 text-primary-600">
                  OP
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                Operator
              </div>
              <div className="text-xs text-gray-500 truncate">
                operator@example.com
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-500"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden border-b border-gray-200">
          <div className="flex items-center h-16 px-4">
            <button
              type="button"
              className="text-gray-500 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4 font-semibold">
              {navigation.find(item => currentPage === item.href.split('/').pop())?.name || 'Dashboard'}
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}