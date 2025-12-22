
export interface Document {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  keywords: string;
  file?: File;
  fileUrl?: string; // This can be a data URL for small files or a placeholder
  fileName?: string;
  fileId?: string; // To reference the file in IndexedDB
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
