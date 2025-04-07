'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ModelProvider, ProviderModel, RegisteredModel } from './page';
import { useRouter } from 'next/navigation';

interface ModelRegistryClientProps {
  initialModels: RegisteredModel[];
  providerModels: Record<string, ProviderModel[]>;
}

export function ModelRegistryClient({ initialModels, providerModels }: ModelRegistryClientProps) {
  const [models, setModels] = useState<RegisteredModel[]>(initialModels);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [provider, setProvider] = useState<ModelProvider>('openai');
  const [modelName, setModelName] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const router = useRouter();
  
  // Handle provider change
  const handleProviderChange = (value: ModelProvider) => {
    setProvider(value);
    setSelectedModelId('');
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelName || (provider !== 'custom' && !selectedModelId) || (provider === 'custom' && !customEndpoint)) {
      return;
    }
    
    setSubmitting(true);
    try {
      // In a real app, you'd call your Go API
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          provider,
          modelId: provider === 'custom' ? 'custom' : selectedModelId,
          status: 'active',
          ...(provider === 'custom' && { customEndpoint })
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register model');
      }
      
      const newModel = await response.json();
      
      // Update local state
      setModels(prevModels => [...prevModels, newModel]);
      
      // Reset form
      setModelName('');
      setSelectedModelId('');
      setCustomEndpoint('');
      
      // Refresh the page to fetch fresh data from server
      router.refresh();
    } catch (error) {
      console.error('Failed to register model:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle model deletion
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      // In a real app, you'd call your Go API
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete model');
      }
      
      // Update local state
      setModels(models.filter(model => model.id !== id));
      
      // Refresh the page to fetch fresh data from server
      router.refresh();
    } catch (error) {
      console.error('Failed to delete model:', error);
    } finally {
      setDeleting(null);
    }
  };
  
  return (
    <>
      {/* Add New Model Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Model</CardTitle>
          <CardDescription>
            Register an AI model to include in your security monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="model-name">Model Name</Label>
                <Input 
                  id="model-name" 
                  placeholder="Production GPT-4" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select 
                  value={provider} 
                  onValueChange={(value) => handleProviderChange(value as ModelProvider)}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="custom">Custom API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {provider !== 'custom' ? (
              <div className="space-y-2">
                <Label htmlFor="model-id">Model</Label>
                <Select 
                  value={selectedModelId} 
                  onValueChange={setSelectedModelId}
                >
                  <SelectTrigger id="model-id">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels[provider]?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="endpoint">Custom API Endpoint</Label>
                <Input 
                  id="endpoint" 
                  placeholder="https://api.example.com/v1/completions" 
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  required={provider === 'custom'}
                />
              </div>
            )}
            
            <Button type="submit" disabled={submitting} className="gap-1">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Model</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Registered Models */}
      <Tabs defaultValue="all" className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All Models</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Models</CardTitle>
              <CardDescription>
                All AI models currently registered for security monitoring.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">No models registered yet.</p>
                  <p className="text-sm text-muted-foreground">Add your first model using the form above.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell className="capitalize">{model.provider}</TableCell>
                        <TableCell>
                          {model.provider !== 'custom'
                            ? providerModels[model.provider]?.find(m => m.id === model.modelId)?.name || model.modelId
                            : 'Custom API'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={model.status === 'active' ? 'default' : 'outline'}>
                            {model.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{model.dateAdded}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(model.id)}
                            disabled={deleting === model.id}
                          >
                            {deleting === model.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models
                    .filter(model => model.status === 'active')
                    .map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell className="capitalize">{model.provider}</TableCell>
                        <TableCell>
                          {model.provider !== 'custom'
                            ? providerModels[model.provider]?.find(m => m.id === model.modelId)?.name || model.modelId
                            : 'Custom API'}
                        </TableCell>
                        <TableCell>{model.dateAdded}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(model.id)}
                            disabled={deleting === model.id}
                          >
                            {deleting === model.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models
                    .filter(model => model.status === 'inactive')
                    .map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell className="capitalize">{model.provider}</TableCell>
                        <TableCell>
                          {model.provider !== 'custom'
                            ? providerModels[model.provider]?.find(m => m.id === model.modelId)?.name || model.modelId
                            : 'Custom API'}
                        </TableCell>
                        <TableCell>{model.dateAdded}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(model.id)}
                            disabled={deleting === model.id}
                          >
                            {deleting === model.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}