import { createWithBaseURL } from '@/lib/utils';
import { ModelRegistryClient } from './client';
import { Metadata } from 'next';

// Types
export type ModelProvider = 'openai' | 'anthropic' | 'custom';

export type ProviderModel = {
  provider: string
  model: string;
  apiUrl: string;
};

export type RegisteredModel = {
  id: string;
  name: string;
  provider: ModelProvider;
  model: string;
  status: 'active' | 'inactive';
  registeredAt: string;
  apiUrl: string;
};

// This would be fetched from your Go API
async function getModels(): Promise<RegisteredModel[]> {
  // In a real app, you'd fetch from your Go API
  const res = await fetch(createWithBaseURL('/model/list'));
  
  const data = await res.json();
  const models = data.models;
  
  console.log('Models:', models);

  return models.map((item: any) => ({
    id: `${item.id}`,
    model: item.model,
    name: item.name,
    provider: item.provider as ModelProvider,
    status: item.status,
    registeredAt: new Date(item.registered_at).toISOString(),
    apiUrl: item.api_url
  }));
  
  // For demo purposes, returning mock data
  // return [
  //   {
  //     id: '1',
  //     name: 'Production GPT-4',
  //     model: 'gpt-4',
  //     provider: 'openai',
  //     status: 'active',
  //     registeredAt: '2025-03-15'
  //   },
  //   {
  //     id: '2',
  //     name: 'Testing Claude',
  //     provider: 'anthropic',
  //     model: 'claude-3-sonnet',
  //     status: 'active',
  //     registeredAt: '2025-03-20'
  //   }
  // ];
}


// This would be fetched from your Go API (or could be part of your API docs)
async function getProviderModels(): Promise<Record<string, ProviderModel[]>> {
  // In a real app, you would fetch from your Go API
  const res = await fetch(createWithBaseURL('/model/list/providers'), { 
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  const data = await res.json();
  
  const result: Partial<Record<ModelProvider, ProviderModel[]>> = {};

  data.providers.forEach(({ provider, models, api_url }: { provider: string; models: string[]; api_url: string }) => {
    result[provider as ModelProvider] = models.map((model) => ({
      provider,
      model,
      apiUrl: api_url,
    }));
  });

  return result as Record<ModelProvider, ProviderModel[]>;
}

export const metadata: Metadata = {
  title: 'Model Registry | AI Security Dashboard',
  description: 'Manage your AI models for security evaluation and monitoring'
};

export default async function ModelRegistryPage() {
  // Fetch data server-side
  const [models, providerModels] = await Promise.all([
    getModels(),
    getProviderModels()
  ]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Model Registry</h2>
        <p className="text-muted-foreground">
          Manage your AI models for security evaluation and monitoring.
        </p>
      </div>
      
      {/* Pass the fetched data to the client component */}
      <ModelRegistryClient 
        initialModels={models} 
        providerModels={providerModels} 
      />
    </div>
  );
}