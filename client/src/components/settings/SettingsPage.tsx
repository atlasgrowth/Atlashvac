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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Lock, 
  Users, 
  Workflow, 
  Mail,
  Save,
  Trash2,
  AlertTriangle,
  FileText,
  Share2,
  Cloud,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// Form schema for profile settings
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  notifications: z.boolean().default(true),
});

// Form schema for business settings
const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
  vertical: z.string(),
});

// Form schema for billing settings
const billingSchema = z.object({
  plan: z.string(),
  billingCycle: z.enum(['monthly', 'annual']),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
});

export function SettingsPage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Profile form setup
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notifications: true,
    },
  });
  
  // Business form setup
  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: currentBusiness?.name || '',
      address: currentBusiness?.address || '',
      city: currentBusiness?.city || '',
      state: currentBusiness?.state || '',
      zip: currentBusiness?.zip || '',
      phone: currentBusiness?.phone || '',
      email: currentBusiness?.email || '',
      website: currentBusiness?.website || '',
      description: currentBusiness?.description || '',
      vertical: currentBusiness?.vertical || 'hvac',
    },
  });
  
  // Billing form setup
  const billingForm = useForm<z.infer<typeof billingSchema>>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      plan: 'professional',
      billingCycle: 'monthly',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const response = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async (data: z.infer<typeof businessSchema>) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update business');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
      toast({
        title: 'Business updated',
        description: 'Your business information has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update business. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Update billing mutation
  const updateBillingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof billingSchema>) => {
      const response = await fetch(`/api/billing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          businessId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update billing information');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Billing updated',
        description: 'Your billing information has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update billing information. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Profile form submission
  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  // Business form submission
  const onBusinessSubmit = (data: z.infer<typeof businessSchema>) => {
    updateBusinessMutation.mutate(data);
  };
  
  // Billing form submission
  const onBillingSubmit = (data: z.infer<typeof billingSchema>) => {
    updateBillingMutation.mutate(data);
  };
  
  // Define profile type
  interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    notifications: boolean;
  }

  // Define billing type
  interface BillingInfo {
    plan: string;
    billingCycle: 'monthly' | 'annual';
    cardName?: string;
    cardNumber?: string;
    expiryDate?: string;
  }

  // Fetch user profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['/api/users/profile'],
  });
  
  // Handle profile data update
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || '',
        notifications: profile.notifications,
      });
    }
  }, [profile, profileForm]);
  
  // Fetch business data (this is already loaded in the business context)
  React.useEffect(() => {
    if (currentBusiness) {
      businessForm.reset({
        name: currentBusiness.name,
        address: currentBusiness.address || '',
        city: currentBusiness.city || '',
        state: currentBusiness.state || '',
        zip: currentBusiness.zip || '',
        phone: currentBusiness.phone || '',
        email: currentBusiness.email || '',
        website: currentBusiness.website || '',
        description: currentBusiness.description || '',
        vertical: currentBusiness.vertical || 'hvac',
      });
    }
  }, [currentBusiness, businessForm]);
  
  // Fetch billing data
  const { data: billing, isLoading: isLoadingBilling } = useQuery<BillingInfo>({
    queryKey: ['/api/billing', businessId],
    enabled: !!businessId,
  });

  // Handle billing data update
  React.useEffect(() => {
    if (billing) {
      billingForm.reset({
        plan: billing.plan,
        billingCycle: billing.billingCycle,
        cardName: billing.cardName || '',
        cardNumber: billing.cardNumber || '',
        expiryDate: billing.expiryDate || '',
        cvv: '',
      });
    }
  }, [billing, billingForm]);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center">
              <Workflow className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" disabled={isLoadingProfile} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" disabled={isLoadingProfile} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="john.doe@example.com" 
                                disabled={isLoadingProfile} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="(555) 123-4567" 
                                disabled={isLoadingProfile} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      
                      <FormField
                        control={profileForm.control}
                        name="notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications about your account and business activity.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoadingProfile}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="submit"
                        disabled={!profileForm.formState.isDirty || updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <Separator className="my-8" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Change Password</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline">
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" variant="outline">
                          <Bell className="mr-2 h-4 w-4" />
                          Setup 2FA
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator className="my-8" />
                
                <div>
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  
                  <div className="mt-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeletingAccount(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                    
                    {isDeletingAccount && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                        <AlertDescription>
                          Deleting your account will remove all of your content and data.
                          Are you absolutely sure you want to proceed?
                        </AlertDescription>
                        <div className="mt-4 flex space-x-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDeletingAccount(false)}
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive">
                            Yes, Delete My Account
                          </Button>
                        </div>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Business Settings */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details, location, and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...businessForm}>
                  <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-6">
                    <FormField
                      control={businessForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Acme Services" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="vertical"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hvac">HVAC</SelectItem>
                              <SelectItem value="plumbing">Plumbing</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                              <SelectItem value="cleaning">Cleaning</SelectItem>
                              <SelectItem value="landscaping">Landscaping</SelectItem>
                              <SelectItem value="roofing">Roofing</SelectItem>
                              <SelectItem value="general">General Contracting</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={businessForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Describe your business services and offerings" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-medium">Location Information</h3>
                    
                    <FormField
                      control={businessForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="123 Main St" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="New York" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="NY" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="zip"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="10001" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={businessForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(555) 123-4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email" 
                                placeholder="info@yourcompany.com" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={businessForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://yourcompany.com" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="submit"
                        disabled={!businessForm.formState.isDirty || updateBusinessMutation.isPending}
                      >
                        {updateBusinessMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>
                  Manage your subscription plan and payment methods.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className={`border-2 ${billingForm.watch('plan') === 'basic' ? 'border-primary' : 'border-transparent'}`}>
                        <CardHeader className="pb-2">
                          <CardTitle>Basic</CardTitle>
                          <CardDescription>
                            For small businesses just getting started
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">
                            $29
                            <span className="text-sm font-normal text-gray-500"> /month</span>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Up to 100 customers</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Basic scheduling</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Email support</span>
                            </li>
                          </ul>
                          <Button 
                            variant={billingForm.watch('plan') === 'basic' ? 'secondary' : 'outline'} 
                            className="w-full"
                            onClick={() => billingForm.setValue('plan', 'basic')}
                          >
                            {billingForm.watch('plan') === 'basic' ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className={`border-2 ${billingForm.watch('plan') === 'professional' ? 'border-primary' : 'border-transparent'}`}>
                        <CardHeader className="pb-2">
                          <CardTitle>Professional</CardTitle>
                          <CardDescription>
                            For growing businesses with more needs
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">
                            $79
                            <span className="text-sm font-normal text-gray-500"> /month</span>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Unlimited customers</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Advanced scheduling</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Priority support</span>
                            </li>
                          </ul>
                          <Button 
                            variant={billingForm.watch('plan') === 'professional' ? 'secondary' : 'outline'} 
                            className="w-full"
                            onClick={() => billingForm.setValue('plan', 'professional')}
                          >
                            {billingForm.watch('plan') === 'professional' ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className={`border-2 ${billingForm.watch('plan') === 'enterprise' ? 'border-primary' : 'border-transparent'}`}>
                        <CardHeader className="pb-2">
                          <CardTitle>Enterprise</CardTitle>
                          <CardDescription>
                            For large businesses with advanced requirements
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-2">
                            $199
                            <span className="text-sm font-normal text-gray-500"> /month</span>
                          </div>
                          <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Unlimited everything</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Custom integrations</span>
                            </li>
                            <li className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              <span>Dedicated support</span>
                            </li>
                          </ul>
                          <Button 
                            variant={billingForm.watch('plan') === 'enterprise' ? 'secondary' : 'outline'} 
                            className="w-full"
                            onClick={() => billingForm.setValue('plan', 'enterprise')}
                          >
                            {billingForm.watch('plan') === 'enterprise' ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <div className={`flex items-center space-x-2 ${billingForm.watch('billingCycle') === 'monthly' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        <div>Monthly billing</div>
                      </div>
                      <Switch
                        checked={billingForm.watch('billingCycle') === 'annual'}
                        onCheckedChange={(checked) => billingForm.setValue('billingCycle', checked ? 'annual' : 'monthly')}
                      />
                      <div className={`flex items-center space-x-2 ${billingForm.watch('billingCycle') === 'annual' ? 'text-primary font-medium' : 'text-gray-500'}`}>
                        <div>Annual billing</div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Save 20%</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                    
                    <Form {...billingForm}>
                      <form onSubmit={billingForm.handleSubmit(onBillingSubmit)} className="space-y-4">
                        <FormField
                          control={billingForm.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name on Card</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={billingForm.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="1234 5678 9012 3456" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={billingForm.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="MM/YY" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={billingForm.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                          <Button
                            type="submit"
                            disabled={updateBillingMutation.isPending}
                          >
                            {updateBillingMutation.isPending ? 'Saving...' : 'Update Billing'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing History</h3>
                    
                    <div className="rounded-md border overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Receipt
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Mar 23, 2025
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Professional Plan - Monthly
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              $79.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Feb 23, 2025
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Professional Plan - Monthly
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              $79.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Jan 23, 2025
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Professional Plan - Monthly
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              $79.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Team Settings */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Invite team members and manage their permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Team Members</h3>
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Invite Team Member
                    </Button>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  You
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {profile ? profile.email : 'you@example.com'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm" disabled>
                              Owner
                            </Button>
                          </td>
                        </tr>
                        
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Jane Smith
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            jane.smith@example.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Manager
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                        
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  John Johnson
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            john.johnson@example.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Technician
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Invited
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              Resend
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>External Integrations</CardTitle>
                <CardDescription>
                  Connect with other services to extend your platform's capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Google Calendar</CardTitle>
                            <CardDescription>
                              Sync your schedule with Google Calendar
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>QuickBooks</CardTitle>
                            <CardDescription>
                              Sync your invoices and payments
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Stripe</CardTitle>
                            <CardDescription>
                              Process payments directly in the platform
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Dropbox</CardTitle>
                            <CardDescription>
                              Store and manage your files
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Mailchimp</CardTitle>
                            <CardDescription>
                              Send marketing emails and newsletters
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Zoom</CardTitle>
                            <CardDescription>
                              Schedule and host video calls with clients
                            </CardDescription>
                          </div>
                          <Switch />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Connect Account
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">API Settings</h3>
                    
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>API Access</CardTitle>
                            <Switch checked={true} />
                          </div>
                          <CardDescription>
                            Enable API access to integrate with custom applications
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded-md space-y-2">
                              <div className="text-sm text-gray-500">API Key</div>
                              <div className="flex items-center">
                                <Input value="••••••••••••••••••••••••" readOnly />
                                <Button variant="ghost" size="sm" className="ml-2">
                                  Copy
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex space-x-4">
                              <Button variant="outline">
                                <Cloud className="mr-2 h-4 w-4" />
                                View API Documentation
                              </Button>
                              <Button variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Regenerate API Key
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Missing components used in this file
const Check = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const RefreshCw = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7l3-3" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7l-3 3" />
  </svg>
)