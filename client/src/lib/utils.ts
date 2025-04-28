import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Business } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to handle null vs undefined in the Business type
export function safelySetBusinessData(business: any): Business | null {
  if (!business) return null;
  
  // Create a new object with the same shape but converting nulls to undefined
  const safeBusiness: Partial<Business> = {
    id: business.id,
    name: business.name,
    slug: business.slug,
    // Convert null to undefined for optional fields
    description: business.description === null ? undefined : business.description,
    address: business.address === null ? undefined : business.address,
    city: business.city === null ? undefined : business.city,
    state: business.state === null ? undefined : business.state,
    zip: business.zip === null ? undefined : business.zip,
    phone: business.phone === null ? undefined : business.phone,
    email: business.email === null ? undefined : business.email,
    website: business.website === null ? undefined : business.website,
    logo: business.logo === null ? undefined : business.logo,
    customDomain: business.customDomain === null ? undefined : business.customDomain,
    vertical: business.vertical,
    userId: business.userId,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt,
    theme: business.theme,
    settings: business.settings
  };
  
  return safeBusiness as Business;
}
