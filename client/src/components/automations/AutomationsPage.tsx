import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Switch,
  Input,
  Button,
  Textarea,
  Separator,
  Skeleton,
} from '@/components/ui/index';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  MailIcon, 
  MessageSquare,
  ClockIcon,
  ZapIcon,
  Bell,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  CircleCheck,
  Star,
  CalendarCheck,
  Users
} from 'lucide-react';

// Define automation schema for forms
const automationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  trigger: z.enum(['job_completed', 'new_customer', 'new_message', 'appointment_scheduled', 'custom']),
  conditions: z.record(z.any()).optional(),
  actions: z.array(
    z.object({
      type: z.string().min(1),
      params: z.record(z.any())
    })
  ).min(1, 'At least one action is required'),
  isActive: z.boolean().default(true),
});

// Define action types
const actionTypes = [
  { id: 'send_sms', label: 'Send SMS', icon: MessageSquare },
  { id: 'send_email', label: 'Send Email', icon: MailIcon },
  { id: 'create_task', label: 'Create Task', icon: ClockIcon },
  { id: 'notify_staff', label: 'Notify Staff', icon: Bell },
];

// Define trigger types
const triggerTypes = [
  { id: 'job_completed', label: 'Job Completed', icon: CircleCheck },
  { id: 'new_customer', label: 'New Customer', icon: Users },
  { id: 'new_message', label: 'New Message', icon: MessageSquare },
  { id: 'appointment_scheduled', label: 'Appointment Scheduled', icon: CalendarCheck },
  { id: 'new_review', label: 'New Review', icon: Star },
  { id: 'custom', label: 'Custom Trigger', icon: ZapIcon },
];

export function AutomationsPage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Form setup
  const form = useForm<z.infer<typeof automationSchema>>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: '',
      description: '',
      trigger: 'job_completed',
      conditions: {},
      actions: [
        {
          type: 'send_sms',
          params: {
            to: '{{contact.phone}}',
            message: 'Thank you for choosing us! We appreciate your business.'
          }
        }
      ],
      isActive: true,
    },
  });
  
  // Get all dynamic actions
  const [actions, setActions] = useState<any[]>(
    form.getValues().actions || []
  );
  
  // Watch the current trigger type
  const currentTrigger = form.watch('trigger');
  
  // Fetch automations
  const { 
    data: automations = [], 
    isLoading: isLoadingAutomations 
  } = useQuery({
    queryKey: [`/api/businesses/${businessId}/automations`],
    enabled: !!businessId,
  });
  
  // Add automation mutation
  const addAutomationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof automationSchema>) => {
      const response = await fetch(`/api/businesses/${businessId}/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          businessId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add automation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Automation added',
        description: 'The automation has been created successfully',
      });
      setIsAddDialogOpen(false);
      form.reset();
      setActions([]);
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/automations`] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding automation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update automation mutation
  const updateAutomationMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: z.infer<typeof automationSchema> }) => {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update automation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Automation updated',
        description: 'The automation has been updated successfully',
      });
      setIsAddDialogOpen(false);
      setEditingAutomation(null);
      form.reset();
      setActions([]);
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/automations`] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating automation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle automation active state
  const toggleAutomationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to toggle automation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/automations`] });
    },
    onError: (error) => {
      toast({
        title: 'Error toggling automation',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: z.infer<typeof automationSchema>) => {
    // Update the actions in the form data
    values.actions = actions;
    
    if (editingAutomation) {
      updateAutomationMutation.mutate({ id: editingAutomation.id, values });
    } else {
      addAutomationMutation.mutate(values);
    }
  };
  
  // Open add dialog
  const openAddDialog = () => {
    form.reset({
      name: '',
      description: '',
      trigger: 'job_completed',
      conditions: {},
      actions: [
        {
          type: 'send_sms',
          params: {
            to: '{{contact.phone}}',
            message: 'Thank you for choosing us! We appreciate your business.'
          }
        }
      ],
      isActive: true,
    });
    setActions([
      {
        type: 'send_sms',
        params: {
          to: '{{contact.phone}}',
          message: 'Thank you for choosing us! We appreciate your business.'
        }
      }
    ]);
    setEditingAutomation(null);
    setSelectedTemplate(null);
    setIsAddDialogOpen(true);
  };
  
  // Open edit dialog
  const openEditDialog = (automation: any) => {
    form.reset({
      name: automation.name,
      description: automation.description || '',
      trigger: automation.trigger,
      conditions: automation.conditions || {},
      actions: automation.actions,
      isActive: automation.isActive,
    });
    setActions(automation.actions || []);
    setEditingAutomation(automation);
    setIsAddDialogOpen(true);
  };
  
  // Add a new action
  const addAction = (type: string) => {
    const newAction = { 
      type,
      params: {}
    };
    
    // Set default params based on type
    if (type === 'send_sms') {
      newAction.params = {
        to: '{{contact.phone}}',
        message: 'Thank you for choosing us! We appreciate your business.'
      };
    } else if (type === 'send_email') {
      newAction.params = {
        to: '{{contact.email}}',
        subject: 'Thank you for your business',
        body: 'We appreciate your business and look forward to serving you again.'
      };
    } else if (type === 'create_task') {
      newAction.params = {
        title: 'Follow up with customer',
        dueDate: '{{now.plus.1.day}}',
        assignedTo: 'staff'
      };
    } else if (type === 'notify_staff') {
      newAction.params = {
        message: 'New task has been created'
      };
    }
    
    setActions([...actions, newAction]);
  };
  
  // Remove an action
  const removeAction = (index: number) => {
    const newActions = [...actions];
    newActions.splice(index, 1);
    setActions(newActions);
  };
  
  // Update action params
  const updateActionParam = (index: number, paramName: string, value: string) => {
    const newActions = [...actions];
    newActions[index].params[paramName] = value;
    setActions(newActions);
  };
  
  // Get automation templates
  const templates = [
    {
      id: 'review_request',
      name: 'Review Request After Job',
      description: 'Automatically send an SMS asking for a review when a job is marked complete',
      trigger: 'job_completed',
      conditions: {},
      actions: [
        {
          type: 'send_sms',
          params: {
            to: '{{contact.phone}}',
            message: 'Thank you for choosing {{business.name}}! We hope you were satisfied with our service. Would you mind leaving us a quick review? {{business.reviewLink}}'
          }
        }
      ]
    },
    {
      id: 'appointment_reminder',
      name: 'Appointment Reminder',
      description: 'Send a reminder 24 hours before a scheduled appointment',
      trigger: 'appointment_scheduled',
      conditions: {},
      actions: [
        {
          type: 'send_sms',
          params: {
            to: '{{contact.phone}}',
            message: 'Reminder: You have an appointment with {{business.name}} tomorrow at {{appointment.time}}. Reply CONFIRM to confirm or RESCHEDULE to change.'
          }
        }
      ]
    },
    {
      id: 'welcome_message',
      name: 'New Customer Welcome',
      description: 'Send a welcome message to new customers',
      trigger: 'new_customer',
      conditions: {},
      actions: [
        {
          type: 'send_email',
          params: {
            to: '{{contact.email}}',
            subject: 'Welcome to {{business.name}}',
            body: 'Thank you for choosing {{business.name}}! We look forward to serving you. Feel free to reach out if you have any questions.'
          }
        }
      ]
    }
  ];
  
  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    form.setValue('name', template.name);
    form.setValue('description', template.description);
    form.setValue('trigger', template.trigger as any);
    form.setValue('conditions', template.conditions);
    
    setActions(template.actions);
    setSelectedTemplate(templateId);
  };
  
  // Render form field based on action type and param name
  const renderActionParamField = (action: any, index: number, paramName: string) => {
    const value = action.params[paramName] || '';
    
    // For message fields, use textarea
    if (paramName === 'message' || paramName === 'body') {
      return (
        <FormItem key={`${index}-${paramName}`} className="mb-2">
          <FormLabel>{paramName.charAt(0).toUpperCase() + paramName.slice(1)}</FormLabel>
          <FormControl>
            <Textarea 
              placeholder={`Enter ${paramName}`}
              value={value}
              onChange={(e) => updateActionParam(index, paramName, e.target.value)}
              rows={3}
            />
          </FormControl>
          <p className="text-xs text-gray-500 mt-1">
            You can use variables like {'{{contact.firstName}}'}, {'{{business.name}}'}
          </p>
        </FormItem>
      );
    }
    
    // For other fields, use input
    return (
      <FormItem key={`${index}-${paramName}`} className="mb-2">
        <FormLabel>{paramName.charAt(0).toUpperCase() + paramName.slice(1)}</FormLabel>
        <FormControl>
          <Input 
            placeholder={`Enter ${paramName}`}
            value={value}
            onChange={(e) => updateActionParam(index, paramName, e.target.value)}
          />
        </FormControl>
      </FormItem>
    );
  };
  
  // Get the icon for a trigger type
  const getTriggerIcon = (triggerType: string) => {
    const trigger = triggerTypes.find(t => t.id === triggerType);
    return trigger ? trigger.icon : ZapIcon;
  };
  
  // Get the icon for an action type
  const getActionIcon = (actionType: string) => {
    const action = actionTypes.find(a => a.id === actionType);
    return action ? action.icon : ZapIcon;
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Automations</h1>
          <Button onClick={openAddDialog} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Automation
          </Button>
        </div>
        
        <p className="mt-2 text-gray-600">
          Create automated workflows to save time and improve customer experience
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Automations</TabsTrigger>
            <TabsTrigger value="all">All Automations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingAutomations ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
              ) : automations.filter((a: any) => a.isActive).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <ZapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active automations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new automation or activating an existing one.
                  </p>
                  <div className="mt-6">
                    <Button onClick={openAddDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Automation
                    </Button>
                  </div>
                </div>
              ) : (
                automations
                  .filter((a: any) => a.isActive)
                  .map((automation: any) => {
                    const TriggerIcon = getTriggerIcon(automation.trigger);
                    return (
                      <Card key={automation.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className="mb-2" variant="outline">
                                <TriggerIcon className="h-3 w-3 mr-1" />
                                {automation.trigger.replace('_', ' ')}
                              </Badge>
                              <CardTitle>{automation.name}</CardTitle>
                            </div>
                            <Switch
                              checked={automation.isActive}
                              onCheckedChange={(checked) => {
                                toggleAutomationMutation.mutate({
                                  id: automation.id,
                                  isActive: checked,
                                });
                              }}
                            />
                          </div>
                          <CardDescription>{automation.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {automation.actions.map((action: any, idx: number) => {
                              const ActionIcon = getActionIcon(action.type);
                              return (
                                <div key={idx} className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                    <ActionIcon className="h-4 w-4 text-primary-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {action.type === 'send_sms' ? 'Send SMS' :
                                       action.type === 'send_email' ? 'Send Email' :
                                       action.type === 'create_task' ? 'Create Task' :
                                       action.type === 'notify_staff' ? 'Notify Staff' :
                                       action.type}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                      {action.params.message || action.params.body || 'Configured action'}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(automation)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500"
                            onClick={() => {
                              toggleAutomationMutation.mutate({
                                id: automation.id,
                                isActive: false,
                              });
                            }}
                          >
                            <PauseCircle className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingAutomations ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))
              ) : automations.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <ZapIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No automations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new automation.
                  </p>
                  <div className="mt-6">
                    <Button onClick={openAddDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Automation
                    </Button>
                  </div>
                </div>
              ) : (
                automations.map((automation: any) => {
                  const TriggerIcon = getTriggerIcon(automation.trigger);
                  const isActive = automation.isActive;
                  
                  return (
                    <Card key={automation.id} className={!isActive ? "opacity-70" : ""}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="mb-2" variant="outline">
                              <TriggerIcon className="h-3 w-3 mr-1" />
                              {automation.trigger.replace('_', ' ')}
                            </Badge>
                            <CardTitle>{automation.name}</CardTitle>
                          </div>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => {
                              toggleAutomationMutation.mutate({
                                id: automation.id,
                                isActive: checked,
                              });
                            }}
                          />
                        </div>
                        <CardDescription>{automation.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {automation.actions.map((action: any, idx: number) => {
                            const ActionIcon = getActionIcon(action.type);
                            return (
                              <div key={idx} className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                  <ActionIcon className="h-4 w-4 text-primary-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {action.type === 'send_sms' ? 'Send SMS' :
                                     action.type === 'send_email' ? 'Send Email' :
                                     action.type === 'create_task' ? 'Create Task' :
                                     action.type === 'notify_staff' ? 'Notify Staff' :
                                     action.type}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                    {action.params.message || action.params.body || 'Configured action'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(automation)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500"
                          onClick={() => {
                            toggleAutomationMutation.mutate({
                              id: automation.id,
                              isActive: !isActive,
                            });
                          }}
                        >
                          {isActive ? (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const TriggerIcon = getTriggerIcon(template.trigger);
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <Badge className="mb-2" variant="outline">
                        <TriggerIcon className="h-3 w-3 mr-1" />
                        {template.trigger.replace('_', ' ')}
                      </Badge>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {template.actions.map((action: any, idx: number) => {
                          const ActionIcon = getActionIcon(action.type);
                          return (
                            <div key={idx} className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                <ActionIcon className="h-4 w-4 text-primary-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {action.type === 'send_sms' ? 'Send SMS' :
                                   action.type === 'send_email' ? 'Send Email' :
                                   action.type === 'create_task' ? 'Create Task' :
                                   action.type === 'notify_staff' ? 'Notify Staff' :
                                   action.type}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                  {action.params.message || action.params.body || 'Configured action'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          applyTemplate(template.id);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Automation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAutomation ? 'Edit Automation' : 'Create New Automation'}</DialogTitle>
            <DialogDescription>
              {editingAutomation
                ? 'Update your automation workflow'
                : 'Set up an automated workflow to save time and improve customer experience'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automation Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Review Request After Job" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe what this automation does" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trigger"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trigger" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {triggerTypes.map((trigger) => (
                            <SelectItem key={trigger.id} value={trigger.id}>
                              <div className="flex items-center">
                                <trigger.icon className="h-4 w-4 mr-2" />
                                {trigger.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Toggle to activate or deactivate this automation
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Actions</h3>
                
                {actions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <AlertTriangle className="mx-auto h-10 w-10 text-yellow-500 mb-2" />
                    <p className="text-gray-500">At least one action is required</p>
                  </div>
                ) : (
                  <div className="space-y-6 mb-6">
                    {actions.map((action, index) => {
                      const ActionIcon = getActionIcon(action.type);
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                <ActionIcon className="h-4 w-4 text-primary-600" />
                              </div>
                              <h4 className="font-medium">
                                {action.type === 'send_sms' ? 'Send SMS' :
                                 action.type === 'send_email' ? 'Send Email' :
                                 action.type === 'create_task' ? 'Create Task' :
                                 action.type === 'notify_staff' ? 'Notify Staff' :
                                 action.type}
                              </h4>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAction(index)}
                              disabled={actions.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {Object.keys(action.params).map((paramName) => 
                              renderActionParamField(action, index, paramName)
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="flex items-center space-x-2 mt-4">
                  <Select onValueChange={addAction}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((action) => (
                        <SelectItem key={action.id} value={action.id}>
                          <div className="flex items-center">
                            <action.icon className="h-4 w-4 mr-2" />
                            {action.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" type="button" onClick={() => addAction('send_sms')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="submit" 
                  disabled={addAutomationMutation.isPending || updateAutomationMutation.isPending}
                >
                  {editingAutomation ? 'Update Automation' : 'Create Automation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
