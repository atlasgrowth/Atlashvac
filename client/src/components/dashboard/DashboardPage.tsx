import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBusinessContext } from '@/hooks/useBusinessContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  Star, 
  MessageSquare, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// Simple stat card component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeDirection = 'up',
  loading = false 
}: { 
  title: string, 
  value: string | number, 
  icon: React.ElementType, 
  change?: string, 
  changeDirection?: 'up' | 'down' | 'neutral',
  loading?: boolean 
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
              {change && (
                <div className="mt-1 flex items-center">
                  {changeDirection === 'up' ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : changeDirection === 'down' ? (
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  ) : (
                    <Minus className="mr-1 h-4 w-4 text-gray-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    changeDirection === 'up' ? 'text-green-500' : 
                    changeDirection === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {change}
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-full bg-primary-50 p-3">
              <Icon className="h-5 w-5 text-primary-500" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function DashboardPage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // Fetch business stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: [`/api/businesses/${businessId}/stats`],
    enabled: !!businessId,
  });
  
  // Fetch recent activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: [`/api/businesses/${businessId}/activities`],
    enabled: !!businessId,
  });
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's an overview of {currentBusiness?.name || 'your business'}.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Customers"
            value={isLoadingStats ? '...' : stats?.activeCustomers || 0}
            icon={Users}
            change="12% increase"
            changeDirection="up"
            loading={isLoadingStats}
          />
          <StatCard
            title="Scheduled Jobs"
            value={isLoadingStats ? '...' : stats?.scheduledJobs || 0}
            icon={Calendar}
            change="5 this week"
            changeDirection="neutral"
            loading={isLoadingStats}
          />
          <StatCard
            title="New Messages"
            value={isLoadingStats ? '...' : stats?.newMessages || 0}
            icon={MessageSquare}
            change={isLoadingStats ? '...' : (stats?.newMessages > 0 ? 'Needs attention' : 'All caught up')}
            changeDirection={isLoadingStats ? 'neutral' : (stats?.newMessages > 0 ? 'up' : 'neutral')}
            loading={isLoadingStats}
          />
          <StatCard
            title="Avg. Rating"
            value={isLoadingStats ? '...' : (stats?.avgReview?.toFixed(1) || '0.0')}
            icon={Star}
            change="Based on reviews"
            changeDirection="neutral"
            loading={isLoadingStats}
          />
        </div>
        
        {/* Middle section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="h-64">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : (
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      Revenue data visualization will appear here
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent activity card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates and events
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoadingActivities ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : activities.length > 0 ? (
                  activities.slice(0, 4).map((activity: any) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                          {activity.type === 'JOB_COMPLETED' && <Calendar className="h-5 w-5" />}
                          {activity.type === 'NEW_MESSAGE' && <MessageSquare className="h-5 w-5" />}
                          {activity.type === 'NEW_REVIEW' && <Star className="h-5 w-5" />}
                          {activity.type === 'NEW_CUSTOMER' && <Users className="h-5 w-5" />}
                          {activity.type === 'APPOINTMENT_SCHEDULED' && <Calendar className="h-5 w-5" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom card */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Website Performance</CardTitle>
              <CardDescription>
                Traffic and visitor stats for your business website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Website Visitors</p>
                        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{stats?.websiteVisitors || 0}</h3>
                        <p className="mt-1 text-xs font-medium text-green-500">
                          <TrendingUp className="inline mr-1 h-3 w-3" />
                          15% increase
                        </p>
                      </div>
                      <div className="rounded-full bg-primary-50 p-3">
                        <BarChart3 className="h-5 w-5 text-primary-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{stats?.conversionRate || '0%'}</h3>
                        <p className="mt-1 text-xs font-medium text-red-500">
                          <TrendingDown className="inline mr-1 h-3 w-3" />
                          2% decrease
                        </p>
                      </div>
                      <div className="rounded-full bg-primary-50 p-3">
                        <ArrowUpRight className="h-5 w-5 text-primary-500" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Session Time</p>
                        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{stats?.avgSessionTime || '0:00'}</h3>
                        <p className="mt-1 text-xs font-medium text-green-500">
                          <TrendingUp className="inline mr-1 h-3 w-3" />
                          10% increase
                        </p>
                      </div>
                      <div className="rounded-full bg-primary-50 p-3">
                        <Calendar className="h-5 w-5 text-primary-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}