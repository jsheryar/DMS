
export interface Document {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  keywords: string;
  file?: File;
  fileUrl?: string;
  fileName?: string;
}

export type UserLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
};

export type UserRole = 'admin' | 'data-entry-operator' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
};
