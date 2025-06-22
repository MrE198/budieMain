export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  channels: NotificationChannel[];
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
  linkedEntity?: {
    type: 'task' | 'event' | 'reminder';
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 
  | 'task-reminder'
  | 'event-reminder'
  | 'task-due'
  | 'event-starting'
  | 'follow-up'
  | 'suggestion'
  | 'system';

export type NotificationStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'snoozed';

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'push'
  | 'in-app'
  | 'whatsapp';