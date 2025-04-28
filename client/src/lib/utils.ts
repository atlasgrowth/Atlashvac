import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Business } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to handle null vs undefined in the Business type
export function safelySetBusinessData(business: Business | null): Business | null {
  if (!business) return null;
  
  // Convert null values to undefined for type compatibility
  const safeBusiness = { ...business };
  
  // For each possibly null field, convert to undefined if null
  if (safeBusiness.description === null) safeBusiness.description = undefined;
  if (safeBusiness.address === null) safeBusiness.address = undefined;
  if (safeBusiness.city === null) safeBusiness.city = undefined;
  if (safeBusiness.state === null) safeBusiness.state = undefined;
  if (safeBusiness.zip === null) safeBusiness.zip = undefined;
  if (safeBusiness.phone === null) safeBusiness.phone = undefined;
  if (safeBusiness.email === null) safeBusiness.email = undefined;
  if (safeBusiness.website === null) safeBusiness.website = undefined;
  if (safeBusiness.logo === null) safeBusiness.logo = undefined;
  if (safeBusiness.customDomain === null) safeBusiness.customDomain = undefined;
  
  return safeBusiness as Business;
}
