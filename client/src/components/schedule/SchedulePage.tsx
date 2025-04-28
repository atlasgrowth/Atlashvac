import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  User,
  MapPin,
  Wrench,
  Filter,
  Search,
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Job status badges
const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-gray-100 text-gray-800';
  
  switch (status) {
    case 'scheduled':
      color = 'bg-blue-100 text-blue-800';
      break;
    case 'in_progress':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'completed':
      color = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
      color = 'bg-red-100 text-red-800';
      break;
  }
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Form schema
const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  contactId: z.string().min(1, 'Contact is required'),
  technicianId: z.string().min(1, 'Technician is required'),
  start: z.string().min(1, 'Start date and time are required'),
  end: z.string().min(1, 'End date and time are required'),
  status: z.string().min(1, 'Status is required'),
  description: z.string().optional(),
  amount: z.string().optional(),
});

export function SchedulePage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch jobs, contacts, and technicians
  const { data: jobs = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: [`/api/businesses/${businessId}/jobs`],
    enabled: !!businessId,
  });
  
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: [`/api/businesses/${businessId}/contacts`],
    enabled: !!businessId,
  });
  
  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery({
    queryKey: [`/api/businesses/${businessId}/technicians`],
    enabled: !!businessId,
  });
  
  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (job: z.infer<typeof jobSchema>) => {
      const response = await fetch(`/api/businesses/${businessId}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...job,
          contactId: parseInt(job.contactId),
          technicianId: parseInt(job.technicianId),
          amount: job.amount ? parseFloat(job.amount) : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/jobs`] });
      setIsAddDialogOpen(false);
      toast({
        title: 'Job scheduled',
        description: 'The job has been scheduled successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to schedule job. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Form setup
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      contactId: '',
      technicianId: '',
      start: `${selectedDate.toISOString().split('T')[0]}T09:00`,
      end: `${selectedDate.toISOString().split('T')[0]}T10:00`,
      status: 'scheduled',
      description: '',
      amount: '',
    },
  });
  
  // Form submit handler
  const onSubmit = (values: z.infer<typeof jobSchema>) => {
    createJobMutation.mutate(values);
  };
  
  // Format jobs for FullCalendar
  const calendarEvents = jobs.map((job: any) => ({
    id: job.id.toString(),
    title: job.title,
    start: job.start,
    end: job.end,
    extendedProps: {
      status: job.status,
      description: job.description,
      contact: contacts.find((c: any) => c.id === job.contactId),
      technician: technicians.find((t: any) => t.id === job.technicianId),
      amount: job.amount,
    },
    backgroundColor: 
      job.status === 'scheduled' ? '#3B82F6' : 
      job.status === 'in_progress' ? '#F59E0B' : 
      job.status === 'completed' ? '#10B981' : 
      job.status === 'cancelled' ? '#EF4444' : '#6B7280',
    borderColor: 
      job.status === 'scheduled' ? '#2563EB' : 
      job.status === 'in_progress' ? '#D97706' : 
      job.status === 'completed' ? '#059669' : 
      job.status === 'cancelled' ? '#DC2626' : '#4B5563',
  }));
  
  // Handle opening the add dialog with a selected date
  const handleDateSelect = (info: any) => {
    setSelectedDate(info.date);
    form.reset({
      ...form.getValues(),
      start: `${info.startStr.split('T')[0]}T09:00`,
      end: `${info.startStr.split('T')[0]}T10:00`,
    });
    setIsAddDialogOpen(true);
  };
  
  // Get today's jobs
  const todaysJobs = jobs.filter((job: any) => {
    const jobDate = new Date(job.start).toDateString();
    const today = new Date().toDateString();
    return jobDate === today;
  }).sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Schedule</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Job
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Today's jobs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Today's Jobs</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : todaysJobs.length === 0 ? (
                <div className="text-center py-6">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs scheduled</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Schedule a job for today to see it here.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Job
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysJobs.map((job: any) => {
                    const contact = contacts.find((c: any) => c.id === job.contactId);
                    const technician = technicians.find((t: any) => t.id === job.technicianId);
                    const startTime = new Date(job.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(job.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <Card key={job.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-sm">{job.title}</h3>
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {startTime} - {endTime}
                              </div>
                              
                              {contact && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  {contact.firstName} {contact.lastName}
                                </div>
                              )}
                              
                              {technician && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                  <Wrench className="h-3 w-3 mr-1" />
                                  {technician.name}
                                </div>
                              )}
                            </div>
                            <StatusBadge status={job.status} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Calendar */}
          <Card className="lg:col-span-3">
            <Tabs defaultValue="week">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-center">
                  <CardTitle>Calendar</CardTitle>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="day" className="mt-0">
                  <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridDay"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: '',
                    }}
                    events={calendarEvents}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                    allDaySlot={false}
                    nowIndicator={true}
                    slotMinTime="07:00:00"
                    slotMaxTime="21:00:00"
                  />
                </TabsContent>
                <TabsContent value="week" className="mt-0">
                  <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: '',
                    }}
                    events={calendarEvents}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                    allDaySlot={false}
                    nowIndicator={true}
                    slotMinTime="07:00:00"
                    slotMaxTime="21:00:00"
                  />
                </TabsContent>
                <TabsContent value="month" className="mt-0">
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: '',
                    }}
                    events={calendarEvents}
                    selectable={true}
                    select={handleDateSelect}
                    height="auto"
                  />
                </TabsContent>
                <TabsContent value="list" className="mt-0">
                  <FullCalendar
                    plugins={[listPlugin, interactionPlugin]}
                    initialView="listMonth"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: '',
                    }}
                    events={calendarEvents}
                    height="auto"
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      {/* Schedule job dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Job</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact: any) => (
                          <SelectItem key={contact.id} value={contact.id.toString()}>
                            {contact.firstName} {contact.lastName}
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
                name="technicianId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technician</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians.map((technician: any) => (
                          <SelectItem key={technician.id} value={technician.id.toString()}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Details about the job" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? 'Scheduling...' : 'Schedule Job'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}