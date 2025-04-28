import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Business {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
  website?: string;
  vertical: string;
  slug: string;
  theme?: Record<string, any>;
  [key: string]: any;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);

  return (
    <BusinessContext.Provider value={{ currentBusiness, setCurrentBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
}