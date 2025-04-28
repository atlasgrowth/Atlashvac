import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { 
  LayoutDashboard, MessageSquare, Users, Star, 
  Calendar, Bot, Globe, Settings, ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  currentTab: string;
}

export function Sidebar({ currentTab }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { currentBusiness, businesses, setCurrentBusiness } = useBusinessContext();
  
  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, current: currentTab === 'dashboard' },
    { name: 'Messages', href: '/app/messages', icon: MessageSquare, current: currentTab === 'messages', badge: 5 },
    { name: 'Contacts', href: '/app/contacts', icon: Users, current: currentTab === 'contacts' },
    { name: 'Reviews', href: '/app/reviews', icon: Star, current: currentTab === 'reviews', badge: 3, badgeColor: 'amber' },
    { name: 'Schedule', href: '/app/schedule', icon: Calendar, current: currentTab === 'schedule' },
    { name: 'Automations', href: '/app/automations', icon: Bot, current: currentTab === 'automations' },
    { name: 'Website', href: '/app/website', icon: Globe, current: currentTab === 'website' },
    { name: 'Settings', href: '/app/settings', icon: Settings, current: currentTab === 'settings' },
  ];

  const switchBusiness = (business: any) => {
    setCurrentBusiness(business);
  };

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 pb-4 bg-white overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-semibold text-gray-800">HomeServ Pro</h1>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(item.href);
                }}
              >
                <a
                  className={cn(
                    item.current 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      item.current 
                        ? 'text-primary-500' 
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                  {item.badge && (
                    <span 
                      className={cn(
                        'ml-auto',
                        item.badgeColor === 'amber' 
                          ? 'bg-amber-500 text-white'
                          : 'bg-primary-100 text-primary-600',
                        'py-0.5 px-2.5 rounded-full text-xs font-medium'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Business Selector */}
        <div className="border-t border-gray-200 p-4">
          {currentBusiness ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={currentBusiness.logo || ''} alt={currentBusiness.name} />
                    <AvatarFallback className="bg-primary-100 text-primary-600">
                      {currentBusiness.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900">{currentBusiness.name}</div>
                    <div className="text-xs text-gray-500">{currentBusiness.vertical?.toUpperCase()} Service</div>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {businesses.map(business => (
                  <DropdownMenuItem 
                    key={business.id}
                    onClick={() => switchBusiness(business)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={business.logo || ''} alt={business.name} />
                      <AvatarFallback className="text-xs bg-primary-100 text-primary-600">
                        {business.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{business.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setLocation('/app/businesses/new')}
                  className="cursor-pointer"
                >
                  <span className="text-primary-600">+ Add New Business</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation('/app/businesses/new')}
            >
              Select a business
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
