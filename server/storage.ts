import { 
  users, businesses, contacts, conversations, messages, equipment, technicians, jobs, reviews, automations, demoTokens,
  type User, type InsertUser, type Business, type InsertBusiness, type Contact, type InsertContact,
  type Conversation, type InsertConversation, type Message, type InsertMessage, type Equipment, 
  type InsertEquipment, type Technician, type InsertTechnician, type Job, type InsertJob,
  type Review, type InsertReview, type Automation, type InsertAutomation, type DemoToken, type InsertDemoToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, ilike } from "drizzle-orm";
import { OutscraperBusinessData } from "@shared/types";
import { slugify } from "@shared/utils";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business methods
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  getBusinessByDomain(domain: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  listBusinesses(userId?: number): Promise<Business[]>;
  importBusinessFromCSV(data: OutscraperBusinessData, userId?: number): Promise<Business>;
  
  // Contact methods
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  listContacts(businessId: number): Promise<Contact[]>;
  
  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
  listConversations(businessId: number): Promise<Conversation[]>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  listMessages(conversationId: number): Promise<Message[]>;
  markMessagesAsRead(conversationId: number): Promise<void>;
  
  // Equipment methods
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipment: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  listEquipment(businessId: number, contactId?: number): Promise<Equipment[]>;
  
  // Technician methods
  getTechnician(id: number): Promise<Technician | undefined>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: number, technician: Partial<InsertTechnician>): Promise<Technician | undefined>;
  listTechnicians(businessId: number): Promise<Technician[]>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  listJobs(businessId: number, contactId?: number): Promise<Job[]>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  listReviews(businessId: number): Promise<Review[]>;
  
  // Automation methods
  getAutomation(id: number): Promise<Automation | undefined>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation | undefined>;
  listAutomations(businessId: number): Promise<Automation[]>;
  
  // Stats methods
  getBusinessStats(businessId: number): Promise<{
    activeCustomers: number;
    scheduledJobs: number;
    newMessages: number;
    avgReview: number;
  }>;
  
  // Demo token methods
  getDemoToken(id: number): Promise<DemoToken | undefined>;
  getDemoTokenByToken(token: string): Promise<DemoToken | undefined>;
  createDemoToken(token: InsertDemoToken): Promise<DemoToken>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
  
  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug));
    return business;
  }
  
  async getBusinessByDomain(domain: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.customDomain, domain));
    return business;
  }
  
  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }
  
  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updatedBusiness] = await db
      .update(businesses)
      .set(business)
      .where(eq(businesses.id, id))
      .returning();
    return updatedBusiness;
  }
  
  async listBusinesses(userId?: number): Promise<Business[]> {
    if (userId) {
      return db.select().from(businesses).where(eq(businesses.userId, userId));
    }
    return db.select().from(businesses);
  }
  
  async importBusinessFromCSV(data: OutscraperBusinessData, userId?: number): Promise<Business> {
    // Generate a slug from the business name
    let slug = slugify(data.name);
    
    // Check if slug exists, if so, append a random suffix
    const existingBusiness = await this.getBusinessBySlug(slug);
    if (existingBusiness) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    // Determine vertical based on category
    let vertical = 'general';
    const category = data.category?.toLowerCase() || '';
    
    if (category.includes('hvac') || category.includes('air') || category.includes('heat')) {
      vertical = 'hvac';
    } else if (category.includes('plumb')) {
      vertical = 'plumbing';
    } else if (category.includes('electric')) {
      vertical = 'electrical';
    } else if (category.includes('clean')) {
      vertical = 'cleaning';
    } else if (category.includes('landscap') || category.includes('lawn')) {
      vertical = 'landscaping';
    } else if (category.includes('roof')) {
      vertical = 'roofing';
    }
    
    const businessData: InsertBusiness = {
      name: data.name,
      slug,
      description: data.description || `Professional ${vertical} services`,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      website: data.website,
      vertical: vertical as any,
      userId: userId,
      theme: {} // Default theme
    };
    
    return this.createBusiness(businessData);
  }
  
  // Contact methods
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set(contact)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }
  
  async listContacts(businessId: number): Promise<Contact[]> {
    return db
      .select()
      .from(contacts)
      .where(eq(contacts.businessId, businessId))
      .orderBy(contacts.lastName);
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }
  
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations).values(conversation).returning();
    return newConversation;
  }
  
  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updatedConversation] = await db
      .update(conversations)
      .set(conversation)
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }
  
  async listConversations(businessId: number): Promise<Conversation[]> {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.businessId, businessId))
      .orderBy(desc(conversations.lastMessageAt));
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    // Update the conversation with last message info
    await db
      .update(conversations)
      .set({
        lastMessage: message.content,
        lastMessageAt: new Date(),
        unreadCount: sql`CASE WHEN ${message.isFromBusiness} THEN 0 ELSE ${conversations.unreadCount} + 1 END`
      })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }
  
  async listMessages(conversationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
  
  async markMessagesAsRead(conversationId: number): Promise<void> {
    // Update message status
    await db
      .update(messages)
      .set({ status: 'read' })
      .where(and(
        eq(messages.conversationId, conversationId),
        eq(messages.isFromBusiness, false),
        eq(messages.status, 'unread')
      ));
    
    // Reset unread count
    await db
      .update(conversations)
      .set({ unreadCount: 0 })
      .where(eq(conversations.id, conversationId));
  }
  
  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equipment] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipment;
  }
  
  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [newEquipment] = await db.insert(equipment).values(equipmentData).returning();
    return newEquipment;
  }
  
  async updateEquipment(id: number, equipmentData: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set(equipmentData)
      .where(eq(equipment.id, id))
      .returning();
    return updatedEquipment;
  }
  
  async listEquipment(businessId: number, contactId?: number): Promise<Equipment[]> {
    if (contactId) {
      return db
        .select()
        .from(equipment)
        .where(and(
          eq(equipment.businessId, businessId),
          eq(equipment.contactId, contactId)
        ));
    }
    return db
      .select()
      .from(equipment)
      .where(eq(equipment.businessId, businessId));
  }
  
  // Technician methods
  async getTechnician(id: number): Promise<Technician | undefined> {
    const [technician] = await db.select().from(technicians).where(eq(technicians.id, id));
    return technician;
  }
  
  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const [newTechnician] = await db.insert(technicians).values(technician).returning();
    return newTechnician;
  }
  
  async updateTechnician(id: number, technician: Partial<InsertTechnician>): Promise<Technician | undefined> {
    const [updatedTechnician] = await db
      .update(technicians)
      .set(technician)
      .where(eq(technicians.id, id))
      .returning();
    return updatedTechnician;
  }
  
  async listTechnicians(businessId: number): Promise<Technician[]> {
    return db
      .select()
      .from(technicians)
      .where(eq(technicians.businessId, businessId));
  }
  
  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }
  
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }
  
  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(job)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }
  
  async listJobs(businessId: number, contactId?: number): Promise<Job[]> {
    if (contactId) {
      return db
        .select()
        .from(jobs)
        .where(and(
          eq(jobs.businessId, businessId),
          eq(jobs.contactId, contactId)
        ))
        .orderBy(jobs.startTime);
    }
    return db
      .select()
      .from(jobs)
      .where(eq(jobs.businessId, businessId))
      .orderBy(jobs.startTime);
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  
  async updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(review)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }
  
  async listReviews(businessId: number): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.businessId, businessId))
      .orderBy(desc(reviews.reviewDate));
  }
  
  // Automation methods
  async getAutomation(id: number): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation;
  }
  
  async createAutomation(automation: InsertAutomation): Promise<Automation> {
    const [newAutomation] = await db.insert(automations).values(automation).returning();
    return newAutomation;
  }
  
  async updateAutomation(id: number, automation: Partial<InsertAutomation>): Promise<Automation | undefined> {
    const [updatedAutomation] = await db
      .update(automations)
      .set(automation)
      .where(eq(automations.id, id))
      .returning();
    return updatedAutomation;
  }
  
  async listAutomations(businessId: number): Promise<Automation[]> {
    return db
      .select()
      .from(automations)
      .where(eq(automations.businessId, businessId));
  }
  
  // Stats methods
  async getBusinessStats(businessId: number): Promise<{
    activeCustomers: number;
    scheduledJobs: number;
    newMessages: number;
    avgReview: number;
  }> {
    // Count active customers (contacts with at least one job)
    const [{ count: activeCustomers }] = await db
      .select({ count: sql`COUNT(DISTINCT ${contacts.id})` })
      .from(contacts)
      .innerJoin(jobs, eq(contacts.id, jobs.contactId))
      .where(eq(contacts.businessId, businessId));
    
    // Count scheduled jobs
    const [{ count: scheduledJobs }] = await db
      .select({ count: sql`COUNT(*)` })
      .from(jobs)
      .where(and(
        eq(jobs.businessId, businessId),
        eq(jobs.status, 'scheduled')
      ));
    
    // Count unread messages
    const [{ count: newMessages }] = await db
      .select({ count: sql`COALESCE(SUM(${conversations.unreadCount}), 0)` })
      .from(conversations)
      .where(eq(conversations.businessId, businessId));
    
    // Calculate average review rating
    const [result] = await db
      .select({ avgRating: sql`COALESCE(AVG(${reviews.rating}), 0)` })
      .from(reviews)
      .where(eq(reviews.businessId, businessId));
    
    const avgReview = parseFloat(result?.avgRating?.toString() || '0');
    
    return {
      activeCustomers: Number(activeCustomers) || 0,
      scheduledJobs: Number(scheduledJobs) || 0,
      newMessages: Number(newMessages) || 0,
      avgReview: Number(avgReview.toFixed(1)) || 0
    };
  }
}

export const storage = new DatabaseStorage();
