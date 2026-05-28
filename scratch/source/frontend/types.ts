
export enum AgentType {
  CLINIC_AI = 'CLINIC_AI',
  PRESCRIPTION = 'PRESCRIPTION',
  PROTOCOL = 'PROTOCOL',
  CATALOG = 'CATALOG'
}

export interface AgentResponse {
  status: 'success' | 'error' | 'loading' | 'idle';
  data?: any;
  error?: string;
  latency?: number;
}

export interface MockDatabaseCollection {
  name: string;
  count: number;
  schema: string[];
}
