import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DemoTokenGeneratorProps {
  businessId: number;
}

interface DemoTokenResponse {
  token: string;
  expiresAt: string;
}

export default function DemoTokenGenerator({ businessId }: DemoTokenGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [demoToken, setDemoToken] = useState<DemoTokenResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Calculate the demo link from the token
  const demoLink = demoToken 
    ? `${window.location.origin}/demo/${demoToken.token}`
    : "";
  
  // Format the expiration date
  const formattedExpiry = demoToken
    ? new Date(demoToken.expiresAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "";
  
  const generateToken = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest({
        url: `/api/demo/businesses/${businessId}/token`,
        method: 'POST'
      });
      
      setDemoToken(response as DemoTokenResponse);
      toast({
        title: "Demo link generated",
        description: "You can now share this link with prospects",
      });
    } catch (error) {
      toast({
        title: "Failed to generate demo link",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    if (demoLink) {
      navigator.clipboard.writeText(demoLink);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Demo link has been copied to clipboard",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Link Generator</CardTitle>
        <CardDescription>
          Generate a demo link for prospects to access a read-only version of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!demoToken ? (
          <div className="text-sm text-muted-foreground">
            <p>Use demo links to give prospects a preview of your business dashboard.</p>
            <p>Each link is valid for 7 days and provides read-only access to your business data.</p>
          </div>
        ) : (
          <>
            <Alert>
              <Link className="h-4 w-4" />
              <AlertTitle>Demo Link Generated</AlertTitle>
              <AlertDescription>
                This link is valid until {formattedExpiry}
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center space-x-2">
              <Input 
                value={demoLink} 
                readOnly 
                className="font-mono text-xs" 
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyToClipboard}
                disabled={copied}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateToken} 
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : demoToken ? "Generate New Link" : "Generate Demo Link"}
        </Button>
      </CardFooter>
    </Card>
  );
}