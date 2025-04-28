import React, { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { ContactsPage } from '@/components/contacts/ContactsPage';
import { ReviewsPage } from '@/components/reviews/ReviewsPage';
import { SchedulePage } from '@/components/schedule/SchedulePage';
import { AutomationsPage } from '@/components/automations/AutomationsPage';
import { WebsitePage } from '@/components/website/WebsitePage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import { Business } from '@shared/schema';
import { safelySetBusinessData } from '@/lib/utils';

export default function AppPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/app/:page');
  const currentPage = params?.page || 'dashboard';
  const { setCurrentBusiness } = useBusinessContext();
  
  // Fetch businesses
  const { data: businesses = [] as Business[], isLoading } = useQuery<Business[]>({
    queryKey: ['/api/businesses'],
  });
  
  // Set first business as current business if none is selected
  useEffect(() => {
    if (businesses.length > 0 && !isLoading) {
      const safeBusiness = safelySetBusinessData(businesses[0]);
      if (safeBusiness) {
        setCurrentBusiness(safeBusiness);
      }
    }
  }, [businesses, isLoading, setCurrentBusiness]);

  // Render the correct page based on the current route
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'messages':
        return <MessagesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'automations':
        return <AutomationsPage />;
      case 'website':
        return <WebsitePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell currentPage={currentPage}>
      {renderPage()}
    </AppShell>
  );
}