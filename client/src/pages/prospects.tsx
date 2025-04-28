import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Business } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, RefreshCw, ExternalLink, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProspectsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  // Query for prospects
  const { 
    data: prospects = [], 
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['/api/prospects', searchTerm, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const url = `/api/prospects${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch prospects');
      }
      return response.json() as Promise<Business[]>;
    }
  });
  
  // Mutation for reseeding from CSV
  const { mutate: reseedFromCsv, isPending: isReseeding } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/prospects/seed', {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error('Failed to reseed prospects');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "CSV Import Successful",
        description: "Prospects have been imported from the CSV file.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
    },
    onError: () => {
      toast({
        title: "CSV Import Failed",
        description: "Failed to import prospects from CSV. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for updating lead status
  const { mutate: updateLeadStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/businesses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadStatus: status })
      });
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Lead status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prospects'] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Helper function to get badge color based on lead status
  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'new': return 'default';
      case 'contacted': return 'secondary';
      case 'follow_up': return 'outline';
      case 'closed': return 'destructive';
      default: return 'default';
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Prospect Pipeline</h1>
          <p className="text-muted-foreground">
            Manage and track potential leads for your business
          </p>
        </div>
        <Button 
          onClick={() => reseedFromCsv()} 
          disabled={isReseeding}
        >
          {isReseeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-import CSV
            </>
          )}
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Prospect Filters</CardTitle>
          <CardDescription>
            Filter prospects by name, address, status, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, address, city..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Lead Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter(undefined);
            }}
          >
            Reset Filters
          </Button>
        </CardFooter>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading prospects...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Failed to load prospects</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : prospects.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground mb-4">No prospects found</p>
          <p className="mb-4">Import prospects from CSV or add them manually</p>
          <Button onClick={() => reseedFromCsv()}>Import from CSV</Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{prospect.name}</span>
                      {prospect.website && (
                        <a 
                          href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground flex items-center mt-1 hover:text-primary"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {prospect.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a href={`tel:${prospect.phone}`}>{prospect.phone}</a>
                        </div>
                      )}
                      {prospect.email && (
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <a href={`mailto:${prospect.email}`}>{prospect.email}</a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div>{prospect.address}</div>
                        <div>{prospect.city}, {prospect.state} {prospect.zip}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={prospect.leadStatus || undefined}
                      onValueChange={(value) => updateLeadStatus({ id: prospect.id, status: value })}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-full max-w-[130px]">
                        <SelectValue>
                          {prospect.leadStatus ? (
                            <Badge variant={getStatusBadgeVariant(prospect.leadStatus) as any}>
                              {prospect.leadStatus.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <span>Set status</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Create demo URL and copy to clipboard
                          const demoUrl = `${window.location.origin}/demo?businessId=${prospect.id}`;
                          navigator.clipboard.writeText(demoUrl);
                          toast({
                            title: "Demo URL Copied",
                            description: "Share this link to give a demo of your service.",
                          });
                        }}
                      >
                        Copy Demo Link
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}