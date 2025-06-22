export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  integrations: UserIntegrations;
  dataRetention: DataRetention;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  timezone: string;
  avatarUrl?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  workingHours: WorkingHours;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;   // HH:mm format
  };
}

export interface WorkingHours {
  enabled: boolean;
  schedule: {
    [key in DayOfWeek]: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
  };
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface UserIntegrations {
  google?: OAuthTokens;
  microsoft?: OAuthTokens;
  whatsapp?: WhatsAppConfig;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}

export interface WhatsAppConfig {
  phoneNumber: string;
  verified: boolean;
  businessAccountId?: string;
}

export interface DataRetention {
  consentDate: Date;
  retentionPeriod: number; // days
  dataDeletionScheduled?: Date;
}