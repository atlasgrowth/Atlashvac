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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  ArrowUpRight,
  Filter,
  User,
  Mail,
  Share2,
  Flag,
  MessageCircle,
  Calendar,
} from 'lucide-react';

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
    </div>
  );
};

export function ReviewsPage() {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  
  // Fetch reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: [`/api/businesses/${businessId}/reviews`],
    enabled: !!businessId,
  });
  
  // Calculate review statistics
  const stats = React.useMemo(() => {
    if (!reviews.length) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    
    const total = reviews.length;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    const average = sum / total;
    
    const distribution = reviews.reduce(
      (acc: Record<number, number>, review: any) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );
    
    return { average, total, distribution };
  }, [reviews]);
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
          <Button>
            <Star className="mr-2 h-4 w-4" />
            Request Reviews
          </Button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        {/* Overview Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Average Rating</h3>
                {isLoadingReviews ? (
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-10 w-20 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.average.toFixed(1)}
                    </div>
                    <div className="flex justify-center">
                      <StarRating rating={stats.average} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Based on {stats.total} reviews</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
                {isLoadingReviews ? (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <span className="text-sm text-gray-500 w-2">{rating}</span>
                        <Star className="h-4 w-4 text-gray-300 ml-1 mr-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.distribution[rating] || 0;
                      const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;
                      
                      return (
                        <div key={rating} className="flex items-center">
                          <span className="text-sm text-gray-500 w-2">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1 mr-2" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-yellow-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 ml-2 w-9">{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Respond to Positive Reviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Address Negative Reviews
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Request Customer Feedback
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    View Reviews Analytics
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Review Tabs */}
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
              <TabsTrigger value="pending">Needs Response</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          
          <TabsContent value="all">
            {isLoadingReviews ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start collecting reviews from your customers to build trust with potential clients.
                  </p>
                  <div className="mt-6">
                    <Button>
                      <Star className="mr-2 h-4 w-4" />
                      Request Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              reviews.map((review: any) => (
                <Card key={review.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{review.customerName}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{review.content}</p>
                    
                    {review.businessResponse && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center mb-2">
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                            <MessageCircle className="h-3 w-3 text-primary-600" />
                          </div>
                          <span className="text-sm font-medium">Your Response</span>
                        </div>
                        <p className="text-sm text-gray-600">{review.businessResponse}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4 space-x-2">
                      {!review.businessResponse && (
                        <Button variant="outline" size="sm">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Respond
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Flag className="mr-2 h-4 w-4" />
                        Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {isLoadingReviews ? (
              <div className="text-center py-12">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-5 w-48 mx-auto mt-4" />
                <Skeleton className="h-4 w-64 mx-auto mt-2" />
              </div>
            ) : (
              <div className="space-y-4">
                {reviews
                  .filter((review: any) => !review.businessResponse)
                  .map((review: any) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{review.customerName}</h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.content}</p>
                        <div className="flex justify-end mt-4">
                          <Button size="sm">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Respond
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                
                {reviews.filter((review: any) => !review.businessResponse).length === 0 && (
                  <div className="text-center py-12">
                    <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You've responded to all your reviews. Great job!
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="positive">
            {!isLoadingReviews && reviews.filter((r: any) => r.rating >= 4).length === 0 ? (
              <div className="text-center py-12">
                <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No positive reviews yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  When you receive reviews with 4 or 5 stars, they'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {!isLoadingReviews && reviews
                  .filter((review: any) => review.rating >= 4)
                  .map((review: any) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{review.customerName}</h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.content}</p>
                        
                        {review.businessResponse && (
                          <div className="mt-4 bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center mb-2">
                              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                                <MessageCircle className="h-3 w-3 text-primary-600" />
                              </div>
                              <span className="text-sm font-medium">Your Response</span>
                            </div>
                            <p className="text-sm text-gray-600">{review.businessResponse}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          {!review.businessResponse && (
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Respond
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="negative">
            {!isLoadingReviews && reviews.filter((r: any) => r.rating <= 3).length === 0 ? (
              <div className="text-center py-12">
                <ThumbsUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No negative reviews</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Great job! You don't have any reviews with 3 stars or less.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {!isLoadingReviews && reviews
                  .filter((review: any) => review.rating <= 3)
                  .map((review: any) => (
                    <Card key={review.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-gray-900">{review.customerName}</h3>
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{review.content}</p>
                        
                        {review.businessResponse && (
                          <div className="mt-4 bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center mb-2">
                              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                                <MessageCircle className="h-3 w-3 text-primary-600" />
                              </div>
                              <span className="text-sm font-medium">Your Response</span>
                            </div>
                            <p className="text-sm text-gray-600">{review.businessResponse}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          {!review.businessResponse && (
                            <Button variant="outline" size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Respond
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}