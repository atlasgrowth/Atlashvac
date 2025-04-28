import React, { useState, useEffect } from 'react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Input,
  Button,
  Textarea,
  Skeleton,
  Switch,
  Label,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/index';
import { 
  Separator,
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from '@/components/ui/index';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Globe,
  ExternalLink,
  Copy,
  Check,
  Edit,
  Save,
  Palette,
  Layout,
  FileText,
  Image,
  AlertCircle,
  Settings,
  Upload,
  RefreshCw,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import verticals from '@shared/verticals.json';
import { slugify } from '@shared/utils';

// Color pickers would be implemented with a color picker library in a real app
const ColorPickerInput = ({ value, onChange }: any) => (
  <div className="flex items-center space-x-2">
    <div 
      className="h-6 w-6 rounded-md border cursor-pointer"
      style={{ backgroundColor: value }}
      onClick={() => {}} // Would open color picker
    />
    <Input 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-24"
    />
  </div>
);

export function WebsitePage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [domainSyncOpen, setDomainSyncOpen] = useState(false);
  
  // Define business schema for forms
  const businessSchema = z.object({
    name: z.string().min(1, 'Business name is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    vertical: z.string(),
    customDomain: z.string().optional(),
  });
  
  // Form setup
  const businessForm = useForm<z.infer<typeof businessSchema>>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: currentBusiness?.name || '',
      slug: currentBusiness?.slug || '',
      description: currentBusiness?.description || '',
      address: currentBusiness?.address || '',
      city: currentBusiness?.city || '',
      state: currentBusiness?.state || '',
      zip: currentBusiness?.zip || '',
      phone: currentBusiness?.phone || '',
      email: currentBusiness?.email || '',
      website: currentBusiness?.website || '',
      vertical: currentBusiness?.vertical || 'hvac',
      customDomain: currentBusiness?.customDomain || '',
    },
  });
  
  // Update form values when business changes
  useEffect(() => {
    if (currentBusiness) {
      businessForm.reset({
        name: currentBusiness.name,
        slug: currentBusiness.slug,
        description: currentBusiness.description || '',
        address: currentBusiness.address || '',
        city: currentBusiness.city || '',
        state: currentBusiness.state || '',
        zip: currentBusiness.zip || '',
        phone: currentBusiness.phone || '',
        email: currentBusiness.email || '',
        website: currentBusiness.website || '',
        vertical: currentBusiness.vertical || 'hvac',
        customDomain: currentBusiness.customDomain || '',
      });
      
      // Set initial theme values
      setThemeValues(currentBusiness.theme || getDefaultTheme(currentBusiness.vertical));
      
      // Set preview URL
      setPreviewUrl(`/${currentBusiness.slug}`);
    }
  }, [currentBusiness]);
  
  // Theme state
  const [themeValues, setThemeValues] = useState<any>({
    primaryColor: '#4f46e5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    headerStyle: 'centered',
    footerStyle: 'standard',
    fontFamily: 'Inter, sans-serif',
    showHero: true,
    showServices: true,
    showReviews: true,
    showContact: true,
  });
  
  // Get default theme based on vertical
  const getDefaultTheme = (vertical: string) => {
    const verticalData = (verticals as Record<string, any>)[vertical] || verticals.general;
    return {
      primaryColor: verticalData.colors?.primary || '#4f46e5',
      secondaryColor: verticalData.colors?.secondary || '#10B981',
      accentColor: verticalData.colors?.accent || '#F59E0B',
      headerStyle: 'centered',
      footerStyle: 'standard',
      fontFamily: 'Inter, sans-serif',
      showHero: true,
      showServices: true,
      showReviews: true,
      showContact: true,
    };
  };
  
  // Update business mutation
  const updateBusinessMutation = useMutation({
    mutationFn: async (values: z.infer<typeof businessSchema>) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update business');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Business updated',
        description: 'Your business information has been updated successfully',
      });
      setIsEditingBusiness(false);
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating business',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update theme mutation
  const updateThemeMutation = useMutation({
    mutationFn: async (theme: any) => {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update theme');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Theme updated',
        description: 'Your website theme has been updated successfully',
      });
      setIsEditingTheme(false);
      queryClient.invalidateQueries({ queryKey: ['/api/businesses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating theme',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Business form submission handler
  const onBusinessSubmit = (values: z.infer<typeof businessSchema>) => {
    updateBusinessMutation.mutate(values);
  };
  
  // Theme form submission handler
  const saveTheme = () => {
    updateThemeMutation.mutate(themeValues);
  };
  
  // Generate slug from business name
  const generateSlug = () => {
    const name = businessForm.getValues('name');
    if (name) {
      const newSlug = slugify(name);
      businessForm.setValue('slug', newSlug);
    }
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };
  
  // Set the theme's website sections
  const updateThemeSection = (section: string, value: boolean) => {
    setThemeValues({
      ...themeValues,
      [section]: value
    });
  };
  
  // Reset theme to default for the current vertical
  const resetThemeToDefault = () => {
    const vertical = businessForm.getValues('vertical');
    const defaultTheme = getDefaultTheme(vertical);
    setThemeValues(defaultTheme);
    
    toast({
      title: 'Theme reset',
      description: 'Theme has been reset to default values'
    });
  };
  
  // Mock domain verification and sync
  const handleDomainSync = () => {
    // This would actually call an API to trigger domain verification
    // and certificate issuance through Vercel Domains API
    
    toast({
      title: 'Domain verification initiated',
      description: 'We are verifying your domain and setting up SSL. This may take a few minutes.'
    });
    
    // Close the dialog
    setDomainSyncOpen(false);
  };
  
  // Determine if custom domain is configured
  const hasCustomDomain = businessForm.watch('customDomain');
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Website</h1>
          {previewUrl && (
            <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
          )}
        </div>
        
        <p className="mt-2 text-gray-600">
          Manage and customize your business marketing website
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="domain">Domain & SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      This information will be displayed on your marketing website
                    </CardDescription>
                  </div>
                  <Button 
                    variant={isEditingBusiness ? "default" : "outline"} 
                    onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                  >
                    {isEditingBusiness ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Information
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...businessForm}>
                  <form 
                    id="business-form" 
                    onSubmit={businessForm.handleSubmit(onBusinessSubmit)} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={businessForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name*</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your business name" 
                                {...field} 
                                disabled={!isEditingBusiness}
                              />
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
                            <FormLabel>Business Type*</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                              disabled={!isEditingBusiness}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a business type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(verticals).map(([key, value]: [string, any]) => (
                                  <SelectItem key={key} value={key}>
                                    {value.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Website Path*</FormLabel>
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 text-gray-500">
                                {window.location.origin}/
                              </div>
                              <FormControl>
                                <Input 
                                  placeholder="your-business-name" 
                                  {...field} 
                                  disabled={!isEditingBusiness}
                                />
                              </FormControl>
                              {isEditingBusiness && (
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={generateSlug}
                                >
                                  Generate
                                </Button>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Business Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your business and services" 
                                {...field} 
                                disabled={!isEditingBusiness}
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Street address" 
                                {...field} 
                                disabled={!isEditingBusiness}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={businessForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City" 
                                  {...field} 
                                  disabled={!isEditingBusiness}
                                />
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
                                <Input 
                                  placeholder="State" 
                                  {...field} 
                                  disabled={!isEditingBusiness}
                                />
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
                              <FormLabel>ZIP</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ZIP code" 
                                  {...field} 
                                  disabled={!isEditingBusiness}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={businessForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Phone number" 
                                {...field} 
                                disabled={!isEditingBusiness}
                                type="tel"
                              />
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Email address" 
                                {...field} 
                                disabled={!isEditingBusiness}
                                type="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={businessForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>External Website (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://yourwebsite.com" 
                                {...field} 
                                disabled={!isEditingBusiness}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              {isEditingBusiness && (
                <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-end">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditingBusiness(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      form="business-form"
                      disabled={updateBusinessMutation.isPending}
                    >
                      Save Changes
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Website Theme</CardTitle>
                    <CardDescription>
                      Customize the appearance of your marketing website
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={resetThemeToDefault}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset to Default
                    </Button>
                    <Button 
                      variant={isEditingTheme ? "default" : "outline"} 
                      onClick={() => {
                        if (isEditingTheme) {
                          saveTheme();
                        } else {
                          setIsEditingTheme(true);
                        }
                      }}
                    >
                      {isEditingTheme ? (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Theme
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Theme
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible defaultValue="colors">
                  <AccordionItem value="colors">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Palette className="mr-2 h-5 w-5" />
                        Colors
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                        <div>
                          <Label>Primary Color</Label>
                          <div className="mt-2">
                            <ColorPickerInput 
                              value={themeValues.primaryColor} 
                              onChange={(color: string) => setThemeValues({...themeValues, primaryColor: color})}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Used for buttons, links and accents</p>
                        </div>
                        
                        <div>
                          <Label>Secondary Color</Label>
                          <div className="mt-2">
                            <ColorPickerInput 
                              value={themeValues.secondaryColor} 
                              onChange={(color: string) => setThemeValues({...themeValues, secondaryColor: color})}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Used for secondary elements</p>
                        </div>
                        
                        <div>
                          <Label>Accent Color</Label>
                          <div className="mt-2">
                            <ColorPickerInput 
                              value={themeValues.accentColor} 
                              onChange={(color: string) => setThemeValues({...themeValues, accentColor: color})}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Used for highlighting important elements</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="layout">
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <Layout className="mr-2 h-5 w-5" />
                        Layout
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div>
                          <Label>Header Style</Label>
                          <Select 
                            disabled={!isEditingTheme}
                            value={themeValues.headerStyle}
                            onValueChange={(value) => setThemeValues({...themeValues, headerStyle: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select header style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="centered">Centered</SelectItem>
                              <SelectItem value="split">Split</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Footer Style</Label>
                          <Select 
                            disabled={!isEditingTheme}
                            value={themeValues.footerStyle}
                            onValueChange={(value) => setThemeValues({...themeValues, footerStyle: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select footer style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Font Family</Label>
                          <Select 
                            disabled={!isEditingTheme}
                            value={themeValues.fontFamily}
                            onValueChange={(value) => setThemeValues({...themeValues, fontFamily: value})}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select font family" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                              <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                              <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                              <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <Label>Sections</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Hero Section</p>
                              <p className="text-sm text-gray-500">Main header section with call-to-action</p>
                            </div>
                            <Switch
                              checked={themeValues.showHero}
                              onCheckedChange={(checked) => updateThemeSection('showHero', checked)}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Services Section</p>
                              <p className="text-sm text-gray-500">Showcase your services</p>
                            </div>
                            <Switch
                              checked={themeValues.showServices}
                              onCheckedChange={(checked) => updateThemeSection('showServices', checked)}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Reviews Section</p>
                              <p className="text-sm text-gray-500">Display customer reviews and testimonials</p>
                            </div>
                            <Switch
                              checked={themeValues.showReviews}
                              onCheckedChange={(checked) => updateThemeSection('showReviews', checked)}
                              disabled={!isEditingTheme}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <p className="font-medium">Contact Section</p>
                              <p className="text-sm text-gray-500">Contact form and business information</p>
                            </div>
                            <Switch
                              checked={themeValues.showContact}
                              onCheckedChange={(checked) => updateThemeSection('showContact', checked)}
                              disabled={!isEditingTheme}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              {isEditingTheme && (
                <CardFooter className="border-t px-6 py-4 bg-gray-50 flex justify-end">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingTheme(false);
                        setThemeValues(currentBusiness?.theme || getDefaultTheme(currentBusiness?.vertical));
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveTheme}
                      disabled={updateThemeMutation.isPending}
                    >
                      Save Theme
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Content</CardTitle>
                <CardDescription>
                  Manage the content displayed on your marketing website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-lg font-medium">Logo</h3>
                      <p className="text-sm text-gray-500">Upload your business logo</p>
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-lg font-medium">Hero Images</h3>
                      <p className="text-sm text-gray-500">Upload images for your hero section</p>
                    </div>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Manage Images
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-lg font-medium">Services</h3>
                      <p className="text-sm text-gray-500">Customize your service listings</p>
                    </div>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Services
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Custom Sections</h3>
                      <p className="text-sm text-gray-500">Add additional content sections</p>
                    </div>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Section
                    </Button>
                  </div>
                </div>
                
                <Alert className="mt-8">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Content Preview</AlertTitle>
                  <AlertDescription>
                    Your website content is populated from your business information and the selected vertical. 
                    Preview your site to see how it looks.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-gray-50">
                <Button 
                  variant="outline" 
                  className="ml-auto"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview Website
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="domain" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Domain & SEO Settings</CardTitle>
                <CardDescription>
                  Configure your custom domain and search engine optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Website URLs</h3>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label>Default URL</Label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 p-2 bg-gray-100 rounded text-gray-700 text-sm">
                            {window.location.origin}/{currentBusiness?.slug}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(`${window.location.origin}/${currentBusiness?.slug}`, 'default')}
                          >
                            {copiedText === 'default' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <Form {...businessForm}>
                        <form id="domain-form" onSubmit={businessForm.handleSubmit(onBusinessSubmit)}>
                          <FormField
                            control={businessForm.control}
                            name="customDomain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Custom Domain</FormLabel>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input 
                                      placeholder="yourbusiness.com" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <Button 
                                    type="submit"
                                    disabled={updateBusinessMutation.isPending}
                                    variant="outline"
                                  >
                                    Save
                                  </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Enter your domain without http:// or www.
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                      
                      {hasCustomDomain && (
                        <div className="mt-4">
                          <div className="rounded-md bg-primary-50 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <Info className="h-5 w-5 text-primary-400" aria-hidden="true" />
                              </div>
                              <div className="ml-3">
                                <h3 className="text-sm font-medium text-primary-800">Domain setup instructions</h3>
                                <div className="mt-2 text-sm text-primary-700">
                                  <p>
                                    To connect your domain, add the following CNAME record to your DNS settings:
                                  </p>
                                  <div className="mt-2 overflow-x-auto">
                                    <table className="min-w-full border border-primary-200 divide-y divide-primary-200">
                                      <thead className="bg-primary-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">Type</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">Name</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">Value</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-primary-200">
                                        <tr>
                                          <td className="px-4 py-2 text-sm text-gray-800">CNAME</td>
                                          <td className="px-4 py-2 text-sm text-gray-800">@</td>
                                          <td className="px-4 py-2 text-sm text-gray-800">
                                            cname.vercel-dns.com.
                                            <Button 
                                              variant="ghost" 
                                              size="xs"
                                              className="ml-2"
                                              onClick={() => copyToClipboard('cname.vercel-dns.com', 'cname')}
                                            >
                                              {copiedText === 'cname' ? (
                                                <Check className="h-3 w-3" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-3"
                                    onClick={() => setDomainSyncOpen(true)}
                                  >
                                    <RefreshCw className="mr-2 h-3 w-3" />
                                    Verify Domain & Setup SSL
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Search Engine Optimization</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="meta-title">Meta Title</Label>
                        <Input 
                          id="meta-title"
                          placeholder="Enter page title (50-60 characters)"
                          className="mt-1"
                          defaultValue={currentBusiness?.name}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This appears in search engine results and browser tabs
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="meta-description">Meta Description</Label>
                        <Textarea 
                          id="meta-description"
                          placeholder="Enter page description (150-160 characters)"
                          className="mt-1"
                          rows={3}
                          defaultValue={currentBusiness?.description}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Brief description displayed in search engine results
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="meta-keywords">Meta Keywords</Label>
                        <Input 
                          id="meta-keywords"
                          placeholder="keyword1, keyword2, keyword3"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Comma-separated keywords (less important for modern SEO)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Domain Verification Dialog */}
      <Dialog open={domainSyncOpen} onOpenChange={setDomainSyncOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Verify Domain & Setup SSL</DialogTitle>
            <DialogDescription>
              We'll check your domain configuration and setup SSL certificates
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Before proceeding, make sure you've added the required CNAME record to your DNS settings.
              This process will:
            </p>
            
            <ul className="list-disc pl-5 text-sm text-gray-500 space-y-2">
              <li>Verify your domain ownership</li>
              <li>Issue an SSL certificate for secure HTTPS connections</li>
              <li>Configure your website to work with your custom domain</li>
            </ul>
            
            <p className="text-sm text-gray-500 mt-4">
              This process can take a few minutes to complete, and up to 24 hours for DNS changes to propagate.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainSyncOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDomainSync}>
              Start Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
