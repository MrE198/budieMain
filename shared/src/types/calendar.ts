export interface CalendarEvent {
  id: string;
  externalId?: string;
  source: 'google' | 'outlook' | 'budie';
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  isAllDay: boolean;
  location?: string;
  virtualMeeting?: {
    url: string;
    provider: string;
  };
  attendees: Attendee[];
  reminders: Reminder[];
  recurrence?: RecurrenceRule;
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private';
  categories: string[];
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface Attendee {
  email: string;
  name?: string;
  status: 'accepted' | 'declined' | 'tentative' | 'pending';
  organizer: boolean;
}

export interface Reminder {
  method: 'email' | 'popup' | 'sms';
  minutes: number;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  count?: number;
  until?: Date;
  byDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
}