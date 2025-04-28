import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { OutscraperBusinessData, WebSocketMessageType, WebSocketMessage } from "@shared/types";
import { Activity, ActivityType } from "@shared/types";
import { insertBusinessSchema, insertContactSchema, insertConversationSchema, insertMessageSchema, insertEquipmentSchema, insertTechnicianSchema, insertJobSchema, insertAutomationSchema, insertDemoTokenSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { createInsertSchema } from "drizzle-zod";
import fs from "fs";
import path from "path";
import verticals from "@shared/verticals.json";

// Map of businessId to connected WebSocket clients
const businessClients = new Map<number, Set<WebSocket>>();
// Map of visitorId to connected WebSocket clients (for chat widget)
const visitorClients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const businessId = parseInt(url.searchParams.get('businessId') || '0');
    const visitorId = url.searchParams.get('visitorId');
    
    if (businessId > 0) {
      // Register business client
      if (!businessClients.has(businessId)) {
        businessClients.set(businessId, new Set());
      }
      businessClients.get(businessId)?.add(ws);
      
      console.log(`Business client connected: ${businessId}`);
      
      // Send initial data
      sendInitialData(ws, businessId);
    } else if (visitorId) {
      // Register visitor client
      visitorClients.set(visitorId, ws);
      console.log(`Visitor client connected: ${visitorId}`);
    }
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        handleWebSocketMessage(message, ws, businessId, visitorId);
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });
    
    ws.on('close', () => {
      if (businessId > 0 && businessClients.has(businessId)) {
        businessClients.get(businessId)?.delete(ws);
      } else if (visitorId) {
        visitorClients.delete(visitorId);
      }
    });
  });
  
  // API Routes
  
  // Business routes
  app.get('/api/businesses', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const businesses = await storage.listBusinesses(userId || undefined);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch businesses' });
    }
  });
  
  app.get('/api/businesses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const business = await storage.getBusiness(id);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json(business);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch business' });
    }
  });
  
  app.get('/api/businesses/slug/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const business = await storage.getBusinessBySlug(slug);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json(business);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch business' });
    }
  });
  
  app.post('/api/businesses', async (req: Request, res: Response) => {
    try {
      const validatedData = insertBusinessSchema.parse(req.body);
      const business = await storage.createBusiness(validatedData);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create business' });
    }
  });
  
  app.put('/api/businesses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBusinessSchema.partial().parse(req.body);
      const business = await storage.updateBusiness(id, validatedData);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update business' });
    }
  });
  
  // CSV import route
  app.post('/api/businesses/import-csv', async (req: Request, res: Response) => {
    try {
      const { csv, userId } = req.body;
      
      if (!csv) {
        return res.status(400).json({ error: 'No CSV data provided' });
      }
      
      // Parse CSV data
      const records = parse(csv, {
        columns: true,
        skip_empty_lines: true
      });
      
      const importedBusinesses = [];
      
      for (const record of records) {
        const businessData: OutscraperBusinessData = {
          name: record.name,
          address: record.address || '',
          city: record.city || '',
          state: record.state || '',
          zip: record.postal_code || record.zip || '',
          phone: record.phone || '',
          website: record.website || '',
          category: record.category || '',
          description: record.description || '',
          reviews: parseInt(record.reviews) || 0,
          rating: parseFloat(record.rating) || 0
        };
        
        const business = await storage.importBusinessFromCSV(businessData, userId);
        importedBusinesses.push(business);
      }
      
      res.status(201).json(importedBusinesses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to import businesses from CSV' });
    }
  });
  
  // Get verticals data
  app.get('/api/verticals', (req: Request, res: Response) => {
    res.json(verticals);
  });
  
  // Contact routes
  app.get('/api/businesses/:businessId/contacts', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const contacts = await storage.listContacts(businessId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });
  
  app.post('/api/businesses/:businessId/contacts', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertContactSchema.parse({ ...req.body, businessId });
      const contact = await storage.createContact(validatedData);
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create contact' });
    }
  });
  
  app.put('/api/contacts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(id, validatedData);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      res.json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });
  
  // Conversation & Message routes
  app.get('/api/businesses/:businessId/conversations', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const conversations = await storage.listConversations(businessId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });
  
  app.post('/api/businesses/:businessId/conversations', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertConversationSchema.parse({ ...req.body, businessId });
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create conversation' });
    }
  });
  
  app.get('/api/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.listMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  app.post('/api/conversations/:id/messages', async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const validatedData = insertMessageSchema.parse({ ...req.body, conversationId });
      const message = await storage.createMessage(validatedData);
      
      // Get conversation to broadcast to clients
      const conversation = await storage.getConversation(conversationId);
      
      if (conversation) {
        // Broadcast message to all connected clients
        broadcastMessage({
          type: WebSocketMessageType.NEW_CHAT_MESSAGE,
          payload: {
            businessId: conversation.businessId,
            conversationId,
            message
          }
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create message' });
    }
  });
  
  app.post('/api/conversations/:id/read', async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      await storage.markMessagesAsRead(conversationId);
      
      // Get conversation to broadcast update
      const conversation = await storage.getConversation(conversationId);
      
      if (conversation) {
        // Broadcast message read status to clients
        broadcastMessage({
          type: WebSocketMessageType.MESSAGE_READ,
          payload: {
            businessId: conversation.businessId,
            conversationId
          }
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  });
  
  // Equipment routes
  app.get('/api/businesses/:businessId/equipment', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      const equipment = await storage.listEquipment(businessId, contactId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch equipment' });
    }
  });
  
  app.post('/api/businesses/:businessId/equipment', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertEquipmentSchema.parse({ ...req.body, businessId });
      const equipment = await storage.createEquipment(validatedData);
      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create equipment' });
    }
  });
  
  // Technician routes
  app.get('/api/businesses/:businessId/technicians', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const technicians = await storage.listTechnicians(businessId);
      res.json(technicians);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch technicians' });
    }
  });
  
  app.post('/api/businesses/:businessId/technicians', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertTechnicianSchema.parse({ ...req.body, businessId });
      const technician = await storage.createTechnician(validatedData);
      res.status(201).json(technician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create technician' });
    }
  });
  
  // Job routes
  app.get('/api/businesses/:businessId/jobs', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const contactId = req.query.contactId ? parseInt(req.query.contactId as string) : undefined;
      const jobs = await storage.listJobs(businessId, contactId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });
  
  app.post('/api/businesses/:businessId/jobs', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertJobSchema.parse({ ...req.body, businessId });
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create job' });
    }
  });
  
  app.put('/api/jobs/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, validatedData);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      // If job status changed to completed, check for automations
      if (validatedData.status === 'completed') {
        triggerAutomations(job.businessId, 'job_completed', { jobId: job.id });
      }
      
      // Broadcast job update
      broadcastMessage({
        type: WebSocketMessageType.JOB_STATUS_CHANGE,
        payload: {
          businessId: job.businessId,
          job
        }
      });
      
      res.json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update job' });
    }
  });
  
  // Review routes
  app.get('/api/businesses/:businessId/reviews', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const reviews = await storage.listReviews(businessId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });
  
  // Automation routes
  app.get('/api/businesses/:businessId/automations', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const automations = await storage.listAutomations(businessId);
      res.json(automations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch automations' });
    }
  });
  
  app.post('/api/businesses/:businessId/automations', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const validatedData = insertAutomationSchema.parse({ ...req.body, businessId });
      const automation = await storage.createAutomation(validatedData);
      res.status(201).json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create automation' });
    }
  });
  
  app.put('/api/automations/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAutomationSchema.partial().parse(req.body);
      const automation = await storage.updateAutomation(id, validatedData);
      
      if (!automation) {
        return res.status(404).json({ error: 'Automation not found' });
      }
      
      res.json(automation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update automation' });
    }
  });
  
  // Demo token routes
  app.post('/api/demo/businesses/:businessId/token', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      
      // Verify the business exists
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      // Generate unique token
      const token = uuidv4();
      
      // Set expiration 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create token in database
      const demoToken = await storage.createDemoToken({
        token,
        businessId,
        expiresAt
      });
      
      res.status(201).json({
        token: demoToken.token,
        expiresAt: demoToken.expiresAt
      });
    } catch (error) {
      console.error('Failed to create demo token:', error);
      res.status(500).json({ error: 'Failed to create demo token' });
    }
  });
  
  app.get('/api/demo/validate/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const demoToken = await storage.getDemoTokenByToken(token);
      
      if (!demoToken) {
        return res.status(404).json({ error: 'Invalid token' });
      }
      
      // Check if token is expired
      if (new Date() > new Date(demoToken.expiresAt)) {
        return res.status(403).json({ error: 'Token expired' });
      }
      
      // Get the business for this token
      const business = await storage.getBusiness(demoToken.businessId);
      
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json({
        business,
        token: demoToken.token,
        expiresAt: demoToken.expiresAt
      });
    } catch (error) {
      console.error('Failed to validate demo token:', error);
      res.status(500).json({ error: 'Failed to validate demo token' });
    }
  });

  // Business stats
  app.get('/api/businesses/:businessId/stats', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const stats = await storage.getBusinessStats(businessId);
      
      // Add mock website stats for now (would be replaced with actual analytics)
      const fullStats = {
        ...stats,
        websiteVisitors: 1247,
        conversionRate: '3.2%',
        avgSessionTime: '2:37'
      };
      
      res.json(fullStats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch business stats' });
    }
  });
  
  // Activity feed (recent activity)
  app.get('/api/businesses/:businessId/activities', async (req: Request, res: Response) => {
    try {
      const businessId = parseInt(req.params.businessId);
      
      // For now, generate mock activities - would be replaced with actual DB queries
      const mockActivities: Activity[] = [
        {
          id: 1,
          type: ActivityType.JOB_COMPLETED,
          businessId,
          title: 'Job completed for Marcus Wilson',
          description: 'AC Maintenance - $149',
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        },
        {
          id: 2,
          type: ActivityType.NEW_MESSAGE,
          businessId,
          title: 'New message from Sarah Johnson',
          description: '"Hi, I need help with my heating system..."',
          createdAt: new Date(Date.now() - 14400000), // 4 hours ago
        },
        {
          id: 3,
          type: ActivityType.NEW_REVIEW,
          businessId,
          title: 'New 5-star review from Alan Parker',
          description: '"Great service, very professional team..."',
          createdAt: new Date(Date.now() - 25200000), // 7 hours ago
        }
      ];
      
      res.json(mockActivities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });
  
  return httpServer;
}

// WebSocket helper functions
async function sendInitialData(ws: WebSocket, businessId: number) {
  try {
    // Send stats
    const stats = await storage.getBusinessStats(businessId);
    ws.send(JSON.stringify({
      type: 'INITIAL_STATS',
      payload: {
        ...stats,
        websiteVisitors: 1247,
        conversionRate: '3.2%',
        avgSessionTime: '2:37'
      }
    }));
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

function handleWebSocketMessage(
  message: WebSocketMessage, 
  ws: WebSocket, 
  businessId?: number,
  visitorId?: string
) {
  switch (message.type) {
    case WebSocketMessageType.NEW_CHAT_MESSAGE:
      // Handle chat message (already handled by API endpoint)
      break;
      
    case WebSocketMessageType.MESSAGE_READ:
      // Handle message read (already handled by API endpoint)
      break;
      
    default:
      console.log('Unhandled message type:', message.type);
  }
}

function broadcastMessage(message: WebSocketMessage) {
  const businessId = message.payload.businessId;
  
  // Send to business clients
  if (businessId && businessClients.has(businessId)) {
    const clients = businessClients.get(businessId);
    clients?.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  // If it's a chat message, also send to the appropriate visitor client
  if (message.type === WebSocketMessageType.NEW_CHAT_MESSAGE) {
    const { conversationId, message: chatMessage } = message.payload;
    
    // In a real implementation, we would look up which visitor this conversation belongs to
    // For demo purposes, we'll broadcast to all visitor clients
    for (const [visitorId, client] of visitorClients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    }
  }
}

// Automation helper function
async function triggerAutomations(businessId: number, trigger: string, context: any) {
  try {
    // Get all active automations with matching trigger
    const automations = await storage.listAutomations(businessId);
    const matchingAutomations = automations.filter(
      a => a.isActive && a.trigger === trigger
    );
    
    for (const automation of matchingAutomations) {
      // Check if conditions are met
      const conditions = automation.conditions as Record<string, any>;
      let conditionsMet = true;
      
      // Simple condition checking logic
      // In a real implementation, this would be more sophisticated
      if (conditions && Object.keys(conditions).length > 0) {
        for (const [key, value] of Object.entries(conditions)) {
          if (context[key] !== value) {
            conditionsMet = false;
            break;
          }
        }
      }
      
      if (conditionsMet) {
        // Execute actions
        const actions = automation.actions as Array<Record<string, any>>;
        
        for (const action of actions) {
          if (action.type === 'send_sms' && trigger === 'job_completed') {
            // In a real implementation, this would call an SMS API
            console.log(`Sending SMS to ${action.params.to}: ${action.params.message}`);
            
            // Broadcast automation triggered
            broadcastMessage({
              type: WebSocketMessageType.AUTOMATION_TRIGGERED,
              payload: {
                businessId,
                automation,
                action,
                context
              }
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error triggering automations:', error);
  }
}
