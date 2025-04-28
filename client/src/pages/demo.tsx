import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Business } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

// Demo context to provide the business and token information
export const DemoContext = React.createContext<{
  business: Business | null;
  token: string | null;
  isDemo: boolean;
}>({
  business: null,
  token: null,
  isDemo: false,
});

interface ValidateTokenResponse {
  business: Business;
  token: string;
  expiresAt: string;
}

export default function DemoPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/demo/:token');
  const token = match ? params.token : null;
  
  // Get business ID from query params (for direct business demo mode)
  const searchParams = new URLSearchParams(window.location.search);
  const businessId = searchParams.get('businessId');
  
  // Fetch business by token or by ID
  const { 
    data: tokenData,
    isLoading: isTokenLoading, 
    isError: isTokenError 
  } = useQuery<ValidateTokenResponse>({
    queryKey: ['/api/demo/validate', token],
    enabled: !!token,
  });
  
  // Fetch business if businessId is provided (for direct business demo)
  const { 
    data: businessData,
    isLoading: isBusinessLoading, 
    isError: isBusinessError 
  } = useQuery<Business>({
    queryKey: ['/api/businesses', businessId],
    queryFn: async () => {
      const response = await apiRequest(`/api/businesses/${businessId}`);
      return response as Business;
    },
    enabled: !!businessId,
  });
  
  // Determine which data source to use
  const isLoading = (!!token && isTokenLoading) || (!!businessId && isBusinessLoading);
  const isError = (!!token && isTokenError) || (!!businessId && isBusinessError);
  
  // Get the business data from either source
  const business = token ? tokenData?.business : businessData;
  
  // Calculate expiration date for display (token mode only)
  const expiryDate = tokenData?.expiresAt 
    ? new Date(tokenData.expiresAt) 
    : null;
  
  const isExpired = expiryDate 
    ? new Date() > expiryDate 
    : false;
    
  // Return loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="mr-2 h-6 w-32">
                <Skeleton className="h-6 w-full" />
              </div>
              Demo
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-full" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Return error state
  if (isError || (!business) || (token && isExpired)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Demo Link</CardTitle>
            <CardDescription>
              {token && isExpired 
                ? "This demo link has expired."
                : "The demo link you used is invalid or has been revoked."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                {token && isExpired 
                  ? "Please request a new demo link from the business."
                  : "Please check the link and try again, or contact the business for a new demo link."}
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button
                onClick={() => setLocation('/')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format expiry date for display (token mode only)
  const formattedExpiry = expiryDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Render the dashboard in demo mode
  return (
    <DemoContext.Provider value={{ 
      business: business, 
      token: tokenData?.token || null, 
      isDemo: true 
    }}>
      <div className="flex flex-col min-h-screen">
        <div className="bg-yellow-100 border-b border-yellow-200 p-2 text-sm text-center">
          <strong>Demo Mode:</strong> This is a read-only preview of {business.name}'s dashboard.
          {token && formattedExpiry && (
            <span> Demo expires on {formattedExpiry}.</span>
          )}
        </div>
        
        <AppShell>
          <DashboardPage />
        </AppShell>
      </div>
    </DemoContext.Provider>
  );
}