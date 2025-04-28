import { Business, Contact, Conversation, Message, Review, Job, Technician, Automation } from './schema';

// WebSocket message types
export enum WebSocketMessageType {
  NEW_CHAT_MESSAGE = 'NEW_CHAT_MESSAGE',
  MESSAGE_READ = 'MESSAGE_READ',
  NEW_REVIEW = 'NEW_REVIEW',
  JOB_STATUS_CHANGE = 'JOB_STATUS_CHANGE',
  AUTOMATION_TRIGGERED = 'AUTOMATION_TRIGGERED',
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}

// Messages
export interface ChatMessagePayload {
  businessId: number;
  conversationId: number;
  message: Message;
}

// Stats
export interface BusinessStats {
  activeCustomers: number;
  scheduledJobs: number;
  newMessages: number;
  avgReview: number;
  websiteVisitors: number;
  conversionRate: string;
  avgSessionTime: string;
}

// Activity
export enum ActivityType {
  JOB_COMPLETED = 'JOB_COMPLETED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_REVIEW = 'NEW_REVIEW',
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  APPOINTMENT_SCHEDULED = 'APPOINTMENT_SCHEDULED',
}

export interface Activity {
  id: number;
  type: ActivityType;
  businessId: number;
  title: string;
  description: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

// CSV Import
export interface OutscraperBusinessData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website?: string;
  category: string;
  description?: string;
  reviews?: number;
  rating?: number;
}

// Marketing site blocks
export interface MarketingSiteBlock {
  type: 'hero' | 'about' | 'services' | 'cta' | 'reviews' | 'contact' | 'footer';
  content: Record<string, any>;
}

// Automations
export interface AutomationTrigger {
  type: string;
  condition?: Record<string, any>;
}

export interface AutomationAction {
  type: string;
  params: Record<string, any>;
}

export interface AutomationWorkflow {
  trigger: AutomationTrigger;
  actions: AutomationAction[];
}
