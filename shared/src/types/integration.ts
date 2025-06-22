export interface Integration {
  id: string;
  userId: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: IntegrationConfig;
  lastSyncAt?: Date;
  syncErrors?: SyncError[];
  createdAt: Date;
  updatedAt: Date;
}

export type IntegrationType = 
  | 'google-calendar'
  | 'google-gmail'
  | 'microsoft-outlook'
  | 'microsoft-calendar'
  | 'whatsapp'
  | 'twilio-sms';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing';

export interface IntegrationConfig {
  [key: string]: any;
}

export interface SyncError {
  timestamp: Date;
  error: string;
  code?: string;
}