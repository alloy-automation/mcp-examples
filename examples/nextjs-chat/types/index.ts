export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolName?: string;
  toolResult?: any;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  category?: string;
  enabled?: boolean;
}

export interface Connection {
  id: string;
  name: string;
  integrationId: string;
  status: 'connected' | 'disconnected' | 'error';
  createdAt: Date;
  config?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: {
    type: 'manual' | 'schedule' | 'webhook' | 'event';
    config?: any;
  };
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  lastRun?: Date;
  nextRun?: Date;
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'loop' | 'parallel';
  name?: string;
  config: any;
  next?: string[];
}

export interface ServerConfig {
  url: string;
  apiKey: string;
  name?: string;
  capabilities?: string[];
}