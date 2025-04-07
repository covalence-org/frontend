import { ModelRegistryClient } from './client';
import { Metadata } from 'next';

// Types
export type ModelProvider = 'openai' | 'anthropic' | 'custom';

export type ProviderModel = {
  id: string;
  name: string;
  description: string;
};

export type RegisteredModel = {
  id: string;
  name: string;
  provider: ModelProvider;
  modelId: string;
  status: 'active' | 'inactive';
  dateAdded: string;
  customEndpoint?: string;
};

// This would be fetched from your Go API
async function getModels(): Promise<RegisteredModel[]> {
  // In a real app, you'd fetch from your Go API
  // const res = await fetch('https://your-api.com/models', { 
  //   cache: 'no-store',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.API_KEY}`
  //   }
  // });
  // return res.json();
  
  // For demo purposes, returning mock data
  return [
    {
      id: '1',
      name: 'Production GPT-4',
      provider: 'openai',
      modelId: 'gpt-4',
      status: 'active',
      dateAdded: '2025-03-15'
    },
    {
      id: '2',
      name: 'Testing Claude',
      provider: 'anthropic',
      modelId: 'claude-3-sonnet',
      status: 'active',
      dateAdded: '2025-03-20'
    }
  ];
}

// This would be fetched from your Go API (or could be part of your API docs)
async function getProviderModels(): Promise<Record<string, ProviderModel[]>> {
  // In a real app, you would fetch from your Go API
  // const res = await fetch('https://your-api.com/provider-models', { 
  //   next: { revalidate: 3600 }, // Cache for 1 hour
  //   headers: {
  //     'Authorization': `Bearer ${process.env.API_KEY}`
  //   }
  // });
  // return res.json();
  
  // For demo purposes, returning mock data
  return {
    openai: [
      { id: 'gpt-4', name: 'GPT-4', description: 'Most powerful model for complex tasks' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' }
    ],
    anthropic: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most capable Claude model' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and efficiency' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast and efficient for shorter content' }
    ]
  };
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