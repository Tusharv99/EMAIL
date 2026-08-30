// frontend/src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
}

export interface Email {
  id: string;
  subject: string;
  body: string;
  recipient: string;
  senderId: string;
  campaignId: string;
  status: 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED';
  scheduledAt: Date;
  sentAt: Date | null;
  failedAt: Date | null;
  errorMessage: string | null;
  retryCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  emails: Email[];
}

export interface Sender {
  id: string;
  name: string;
  email: string;
  userId: string;
  isActive: boolean;
}