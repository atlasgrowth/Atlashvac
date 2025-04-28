import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Lock, 
  Smartphone, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <Tabs defaultValue="account">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto space-y-1 w-full">
                <TabsTrigger value="account" className="justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="billing" className="justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="api" className="justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  API
                </TabsTrigger>
                <TabsTrigger value="help" className="justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            
            <div className="flex-1">
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="First Name"
                            defaultValue="Admin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Last Name"
                            defaultValue="User"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Email"
                          defaultValue="admin@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Phone"
                          defaultValue="(555) 123-4567"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Update your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input 
                          type="password" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Current Password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input 
                          type="password" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="New Password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Confirm New Password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button>
                        Update Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive email notifications</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            defaultChecked
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                          <p className="text-sm text-gray-500">Receive text message alerts</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            id="sms-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            defaultChecked
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Browser Notifications</h3>
                          <p className="text-sm text-gray-500">Receive browser push notifications</p>
                        </div>
                        <div className="flex items-center h-6">
                          <input
                            id="browser-notifications"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            defaultChecked
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>
                      Manage your subscription and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary-50 rounded-md border border-primary-100 mb-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Pro Plan</h3>
                          <p className="text-sm text-gray-500">$49.99/month</p>
                        </div>
                        <div className="bg-primary-100 text-primary-800 text-xs font-semibold py-1 px-2 rounded-full">
                          Current Plan
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-center">
                        Manage Subscription
                      </Button>
                      <Button variant="outline" className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50">
                        Cancel Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                      Update your payment information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border border-gray-200 rounded-md mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-12 mr-3 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">Visa ending in 4242</div>
                            <div className="text-sm text-gray-500">Expires 12/2025</div>
                          </div>
                        </div>
                        <div className="text-xs bg-gray-100 text-gray-800 font-semibold py-1 px-2 rounded-full">
                          Default
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View and download your past invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md divide-y">
                      {[
                        { date: 'Mar 1, 2023', amount: '$49.99', status: 'Paid' },
                        { date: 'Feb 1, 2023', amount: '$49.99', status: 'Paid' },
                        { date: 'Jan 1, 2023', amount: '$49.99', status: 'Paid' },
                      ].map((invoice, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.date}</div>
                            <div className="text-sm text-gray-500">{invoice.amount}</div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {invoice.status}
                            </span>
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Access</CardTitle>
                    <CardDescription>
                      Manage your API keys and access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Secret API Key</h3>
                          <div className="mt-1 flex items-center space-x-2">
                            <input
                              type="password"
                              className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 w-64"
                              value="sk_live_••••••••••••••••••••••••"
                              readOnly
                            />
                            <Button variant="outline" size="sm">
                              Show
                            </Button>
                            <Button variant="outline" size="sm">
                              Copy
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">Webhook Settings</h3>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Webhook URL</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="https://yourdomain.com/webhook"
                        />
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button>
                          Save Webhook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="help" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Get help with your account and application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                          <h3 className="text-sm font-medium text-gray-900">Documentation</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-4">
                            Find guides and documentation to help you get the most out of our platform.
                          </p>
                          <Button variant="outline">
                            View Documentation
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                          <h3 className="text-sm font-medium text-gray-900">Contact Support</h3>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-500 mb-4">
                            Having trouble? Contact our support team for assistance.
                          </p>
                          <Button>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Support
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="border-b border-gray-200 p-4 bg-gray-50">
                          <h3 className="text-sm font-medium text-gray-900">FAQ</h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">How do I update my business information?</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                You can update your business information from the Website settings section.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">How do I add a new user to my account?</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Currently, we support single user accounts. Multi-user functionality is coming soon.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">How do I cancel my subscription?</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                You can cancel your subscription from the Billing tab in Settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}