import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Business } from "@shared/schema";

interface ValidateTokenResponse {
  business: Business;
  token: string;
  expiresAt: string;
}

export default function DemoPage() {
  const [match, params] = useRoute('/demo/:token');
  const [, setLocation] = useLocation();
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Query to validate token
  const { data, isLoading, isError } = useQuery({
    queryKey: ['demoToken', params?.token],
    queryFn: async () => {
      if (!params?.token) return null;
      const response = await fetch(`/api/demo/validate/${params.token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to validate token');
      }
      return response.json() as Promise<ValidateTokenResponse>;
    },
    enabled: !!params?.token,
    retry: false
  });
  
  useEffect(() => {
    if (isLoading) return;
    
    if (isError || !data) {
      setValidating(false);
      setError('The demo link is invalid or has expired. Please request a new one.');
      return;
    }
    
    // If validation successful, redirect to dashboard with token as query param
    if (data) {
      // We'll use the token for authentication in the demo
      setLocation(`/app/business/${data.business.id}?demo=true&token=${data.token}`);
    }
  }, [data, isLoading, isError, setLocation]);
  
  if (validating || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Validating Demo Access</CardTitle>
            <CardDescription>Please wait while we check your demo link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Demo Link Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The demo link you're trying to use is either invalid or has expired. Please contact the business owner to request a new demo link.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => setLocation('/')}>Return to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return null; // Will redirect to app, so we won't render this
}