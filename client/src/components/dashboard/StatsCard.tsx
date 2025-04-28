import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  changeType?: 'increase' | 'decrease';
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100'
}: StatsCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={cn(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}>
                    <svg 
                      className={cn(
                        "self-center flex-shrink-0 h-5 w-5",
                        changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                      )}
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d={changeType === 'increase' 
                          ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" 
                          : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        } 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className="sr-only">{changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
